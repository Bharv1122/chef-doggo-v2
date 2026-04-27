// RECIPE GENERATOR — Mock implementation using templates + calculation.
// To connect a real AI API, replace the body of generateRecipe() below.
// The function signature and return type stay the same.

import type { DogProfile } from '../types/dog';
import type {
  Recipe, RecipeType, RecipeIngredient, CookingStep,
  SupplementItem, ShoppingListItem, BatchDuration,
} from '../types/recipe';
import {
  TOPPER_TEMPLATES, FULL_MEAL_TEMPLATES, BATCH_TEMPLATES,
  TREAT_TEMPLATES, type RecipeTemplate,
} from '../data/recipeTemplates';
import { getIngredientById } from '../data/ingredients';
import { getAllSupplements } from '../data/supplements';
import {
  calcServing, calcBatch, splitIngredients, calcDER,
  gramsToOz, gramsToCups, groceryLabel,
} from './calculator';
import { validateIngredients, GENERAL_VET_DISCLAIMER, SUPPLEMENT_SAFETY_NOTE } from './safetyValidator';
import { generateId } from './storage';

export interface GeneratorInput {
  dog: DogProfile;
  recipeType: RecipeType;
  batchDuration?: BatchDuration;
  preferredProteinIds?: string[];
  budgetMode?: boolean;
  pantryIngredientIds?: string[];
  forceTemplateId?: string;
}

// REPLACE THIS FUNCTION BODY with a real API call when ready.
export async function generateRecipe(input: GeneratorInput): Promise<Recipe> {
  const { dog, recipeType, batchDuration = '7day', budgetMode = false } = input;

  // 1. Pick template
  const template = pickTemplate(input);

  // 2. Safety check on all template ingredient names
  const ingredientNames = [
    ...template.proteinIds,
    ...template.carbIds,
    ...template.vegetableIds,
    ...template.fatIds,
  ]
    .map(id => getIngredientById(id)?.name ?? id)
    .filter(Boolean);

  const safety = validateIngredients(ingredientNames, dog);
  if (!safety.safe) {
    throw new Error(`Safety check failed: ${safety.errors.join('; ')}`);
  }

  // 3. Calculate portions
  const baseServing = calcServing(dog);
  const effectiveDuration: BatchDuration =
    recipeType === 'full_meal' || recipeType === 'batch_week' ? batchDuration : '1day';
  const batch = calcBatch(baseServing, effectiveDuration);

  const treatDailyCalorieCap = Math.max(1, Math.round(calcDER(dog) * 0.1));
  const treatDailyGramsCap = Math.max(10, Math.round(treatDailyCalorieCap / 3)); // ~3 kcal/g treat estimate

  const serving = recipeType === 'treat'
    ? {
        gramsPerMeal: Math.max(5, Math.round(treatDailyGramsCap / 2)),
        cupsPerMeal: Math.round((Math.max(5, Math.round(treatDailyGramsCap / 2)) / 240) * 10) / 10,
        mealsPerDay: 2,
        totalDailyGrams: treatDailyGramsCap,
      }
    : baseServing;

  const totalGrams = recipeType === 'topper'
    ? Math.round(baseServing.totalDailyGrams * 0.15) // toppers are ~15% of daily food
    : recipeType === 'treat'
    ? treatDailyGramsCap
    : batch.totalYieldGrams;

  const split = splitIngredients(totalGrams);

  // 4. Build ingredient list
  const ingredients = buildIngredients(template, split, recipeType, dog);

  // 5. Build cooking steps
  const instructions = buildInstructions(template, recipeType);

  // 5b. Estimate nutrition from actual ingredient composition
  const estimatedNutrition = estimateNutrition(ingredients, recipeType, serving, batch, treatDailyCalorieCap);

  // 6. Build supplement list (full meals only)
  const supplements: SupplementItem[] = recipeType === 'full_meal' || recipeType === 'batch_week'
    ? buildSupplements(dog)
    : [];

  // 7. Build shopping list
  const shoppingList = buildShoppingList(ingredients, supplements, recipeType, batch);

  // 8. Build storage info
  const storage = buildStorage(recipeType);

  // 9. Safety notes
  const safetyNotes = buildSafetyNotes(recipeType, template, dog, safety.warnings);

  // 10. Transition guide (full meals only)
  const transitionGuide = recipeType === 'full_meal' ? TRANSITION_GUIDE : undefined;

  const now = new Date().toISOString();

  return {
    id: generateId(),
    dogProfileId: dog.id,
    name: template.name,
    description: template.description,
    type: recipeType,
    ingredients,
    instructions,
    nutrition: estimatedNutrition,
    serving,
    batch,
    supplements,
    storage,
    shoppingList,
    safetyNotes,
    vetDisclaimer: GENERAL_VET_DISCLAIMER,
    isFavorite: false,
    scaleFactor: 1,
    transitionGuide,
    createdAt: now,
    updatedAt: now,
  };
}

function estimateNutrition(
  ingredients: RecipeIngredient[],
  recipeType: RecipeType,
  serving: { mealsPerDay: number },
  batch: { numberOfMeals: number },
  treatDailyCalorieCap: number
) {
  const totalCalories = ingredients.reduce((sum, ingredient) => {
    const source = getIngredientById(ingredient.ingredientId);
    if (!source) return sum;
    return sum + source.caloriesPerGram * ingredient.amountGrams;
  }, 0);

  if (recipeType === 'treat') {
    return {
      caloriesPerServing: Math.max(1, Math.round(treatDailyCalorieCap / serving.mealsPerDay)),
      caloriesPerDay: treatDailyCalorieCap,
      isEstimate: true as const,
    };
  }

  const servings = recipeType === 'full_meal' || recipeType === 'batch_week'
    ? Math.max(1, batch.numberOfMeals)
    : Math.max(1, serving.mealsPerDay);

  const caloriesPerServing = Math.max(1, Math.round(totalCalories / servings));

  return {
    caloriesPerServing,
    caloriesPerDay: Math.max(1, Math.round(caloriesPerServing * serving.mealsPerDay)),
    isEstimate: true as const,
  };
}

// ── Template selection ─────────────────────────────────────────────────────────
function pickTemplate(input: GeneratorInput): RecipeTemplate {
  const { recipeType, forceTemplateId, preferredProteinIds = [], budgetMode, dog } = input;

  const pool: RecipeTemplate[] =
    recipeType === 'topper' ? TOPPER_TEMPLATES :
    recipeType === 'full_meal' ? FULL_MEAL_TEMPLATES :
    recipeType === 'batch_week' ? BATCH_TEMPLATES :
    recipeType === 'treat' ? TREAT_TEMPLATES :
    TOPPER_TEMPLATES;

  if (forceTemplateId) {
    const found = pool.find(t => t.id === forceTemplateId);
    if (found) return found;
  }

  // Filter by budget
  let candidates = budgetMode ? pool.filter(t => t.budgetFriendly) : [...pool];
  if (!candidates.length) candidates = [...pool];

  // Filter by preferred proteins
  if (preferredProteinIds.length) {
    const proteinMatch = candidates.filter(t =>
      t.proteinIds.some(p => preferredProteinIds.includes(p))
    );
    if (proteinMatch.length) candidates = proteinMatch;
  }

  // Filter out templates with allergenic ingredients
  if (dog.allergies.length) {
    const allergyLower = dog.allergies.map(a => a.toLowerCase());
    candidates = candidates.filter(t => {
      const allIds = [...t.proteinIds, ...t.carbIds, ...t.vegetableIds, ...t.fatIds];
      return !allIds.some(id => {
        const ing = getIngredientById(id);
        return ing && allergyLower.some(a => ing.name.toLowerCase().includes(a));
      });
    });
    if (!candidates.length) candidates = [...pool];
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Ingredient builder ────────────────────────────────────────────────────────
function baseFishOilDailyGrams(weightLbs: number): number {
  const estimate = weightLbs * 0.05; // ~1g fish oil per 20 lbs body weight
  return Math.round(Math.min(3, Math.max(0.5, estimate)) * 10) / 10;
}

function scaledFishOilGrams(weightLbs: number, totalGrams: number): number {
  const dailyAmount = baseFishOilDailyGrams(weightLbs);
  const ingredientScaledAmount = Math.max(dailyAmount, totalGrams * 0.005);
  return Math.round(ingredientScaledAmount * 10) / 10;
}

function buildIngredients(
  template: RecipeTemplate,
  split: { proteinGrams: number; carbGrams: number; vegGrams: number; fatGrams: number },
  recipeType: RecipeType,
  dog: DogProfile
): RecipeIngredient[] {
  const items: RecipeIngredient[] = [];

  const addIngredients = (
    ids: string[],
    totalGrams: number,
    category: RecipeIngredient['category']
  ) => {
    if (!ids.length) return;
    const gramsEach = Math.round(totalGrams / ids.length);
    for (const id of ids) {
      const ing = getIngredientById(id);
      if (!ing) continue;

      const isFishOilSupplement = id === 'fish_oil';
      const amountGrams = isFishOilSupplement ? scaledFishOilGrams(dog.weightLbs, totalGrams) : gramsEach;
      const amountCups = isFishOilSupplement ? undefined : gramsToCups(amountGrams);
      const amountOz = gramsToOz(amountGrams);

      items.push({
        ingredientId: id,
        name: ing.name,
        category: isFishOilSupplement ? 'supplement' : category,
        amountGrams,
        amountCups,
        amountOz,
        groceryFriendlyAmount: isFishOilSupplement
          ? `about ${amountGrams}g (${amountOz} oz) ${ing.name} total`
          : groceryLabel(amountGrams, ing.name),
        prepNote: ing.prepNotes,
      });
    }
  };

  if (recipeType === 'treat') {
    // treats use small fixed amounts
    const allIds = [
      ...template.proteinIds, ...template.carbIds,
      ...template.vegetableIds, ...template.supplementIds,
    ];
    allIds.forEach(id => {
      const ing = getIngredientById(id);
      if (!ing) return;
      const g = 50;
      const cat: RecipeIngredient['category'] =
        ing.category === 'treat' ? 'treat' : ing.category;
      items.push({
        ingredientId: id,
        name: ing.name,
        category: cat,
        amountGrams: g,
        amountCups: gramsToCups(g),
        amountOz: gramsToOz(g),
        groceryFriendlyAmount: groceryLabel(g, ing.name),
        prepNote: ing.prepNotes,
      });
    });
    return items;
  }

  addIngredients(template.proteinIds, split.proteinGrams, 'protein');
  addIngredients(template.carbIds, split.carbGrams, 'carb');
  addIngredients(template.vegetableIds, split.vegGrams, 'vegetable');
  addIngredients(template.fatIds, split.fatGrams, 'fat');

  return items;
}

// ── Instructions builder ──────────────────────────────────────────────────────
function buildInstructions(template: RecipeTemplate, recipeType: RecipeType): CookingStep[] {
  const isTopper = recipeType === 'topper';
  const isTreat = recipeType === 'treat';
  const isBatch = recipeType === 'batch_week';

  const proteins = template.proteinIds.map(id => getIngredientById(id)?.name ?? id).join(' and ');
  const carbs = template.carbIds.map(id => getIngredientById(id)?.name ?? id).join(' and ');
  const vegs = template.vegetableIds.map(id => getIngredientById(id)?.name ?? id).join(' and ');

  if (isTreat) {
    return TREAT_INSTRUCTIONS[template.id] ?? DEFAULT_TREAT_INSTRUCTIONS;
  }

  const steps: CookingStep[] = [
    {
      stepNumber: 1,
      instruction: `Gather all ingredients: ${[proteins, carbs, vegs].filter(Boolean).join(', ')}. Weigh or measure according to your dog's portion size.`,
      tip: 'Prep everything before you start cooking — it makes the process much smoother.',
    },
  ];

  let step = 2;

  if (template.proteinIds.length) {
    steps.push({
      stepNumber: step++,
      instruction: `Cook ${proteins}: ${getIngredientById(template.proteinIds[0])?.prepNotes ?? 'Cook thoroughly with no seasoning until cooked through. No salt, oil, or spices.'}`,
      durationMinutes: template.type === 'batch_week' ? 30 : 20,
      tip: 'Internal temperature for poultry should reach 165°F. For ground meats, 160°F.',
    });
  }

  if (template.carbIds.length) {
    steps.push({
      stepNumber: step++,
      instruction: `Cook ${carbs}: ${getIngredientById(template.carbIds[0])?.prepNotes ?? 'Cook plain in water with no salt or seasoning.'}`,
      durationMinutes: 20,
      tip: 'Cook the carbs at the same time as the protein to save time.',
    });
  }

  if (template.vegetableIds.length) {
    steps.push({
      stepNumber: step++,
      instruction: `Prepare vegetables: Steam or lightly boil ${vegs} until just soft. Do not overcook — you want them soft enough for your dog to chew easily.`,
      durationMinutes: 10,
      tip: 'Steaming preserves more nutrients than boiling.',
    });
  }

  steps.push({
    stepNumber: step++,
    instruction: 'Let everything cool completely to room temperature before combining. Never add supplements or fish oil to hot food.',
    tip: 'Hot food can destroy the omega-3s in fish oil and some vitamins. Always cool first.',
  });

  steps.push({
    stepNumber: step++,
    instruction: 'Combine protein, carbs, and vegetables in a large bowl. Mix gently. Add fish oil and any supplements now.',
    tip: 'For batch cooking, use a large pot or mixing bowl. Mix thoroughly so supplements are evenly distributed.',
  });

  if (isBatch) {
    steps.push({
      stepNumber: step++,
      instruction: 'Divide the batch into individual meal-sized portions. Use airtight containers. Label each container with the date.',
      tip: 'Silicone muffin trays work great for freezing individual portions.',
    });
    steps.push({
      stepNumber: step++,
      instruction: 'Refrigerate 3–4 days\' worth of portions. Freeze the remaining portions. Thaw in the refrigerator overnight before serving.',
      durationMinutes: 5,
      tip: 'Never thaw in the microwave — it creates uneven hot spots and can degrade nutrients.',
    });
  } else if (!isTopper) {
    steps.push({
      stepNumber: step++,
      instruction: 'Portion into meal-sized servings. Store in airtight containers in the refrigerator for up to 3–4 days, or freeze for up to 3 months.',
    });
  }

  steps.push({
    stepNumber: step++,
    instruction: 'Serve at room temperature or slightly warm. Start with small amounts if transitioning from commercial food, and increase gradually over 7–10 days.',
    tip: isTopper
      ? 'Add the topper on top of your dog\'s regular food. Start with a tablespoon and adjust to the recommended serving amount.'
      : 'Sudden diet changes can cause digestive upset. Introduce homemade food gradually.',
  });

  return steps;
}

// ── Supplement builder ────────────────────────────────────────────────────────
function buildSupplements(dog: DogProfile): SupplementItem[] {
  return getAllSupplements().map(s => ({
    name: s.name,
    category: s.category,
    isRequired: s.isRequired,
    estimatedAmount: s.estimatedRangeNote,
    vetReviewNote: SUPPLEMENT_SAFETY_NOTE,
    exampleProducts: s.exampleProducts,
  }));
}

// ── Shopping list builder ─────────────────────────────────────────────────────
function buildShoppingList(
  ingredients: RecipeIngredient[],
  supplements: SupplementItem[],
  recipeType: RecipeType,
  batch: { numberOfContainers: number }
): ShoppingListItem[] {
  const items: ShoppingListItem[] = ingredients.map(ing => ({
    name: ing.name,
    displayAmount: ing.groceryFriendlyAmount,
    category: ingCategoryToShopping(ing.category),
    note: ing.prepNote,
  }));

  if (recipeType === 'full_meal' || recipeType === 'batch_week') {
    const hasFishOilInIngredients = ingredients.some(ing => ing.ingredientId === 'fish_oil');

    for (const s of supplements) {
      const isOmega3 = s.name.toLowerCase().includes('omega-3');
      if (!s.isRequired || (isOmega3 && hasFishOilInIngredients)) {
        continue;
      }

      items.push({
        name: s.name,
        displayAmount: '(ask your vet for dosing)',
        category: 'supplement',
        note: s.vetReviewNote,
      });
    }

    if (recipeType === 'batch_week') {
      items.push({
        name: 'Airtight storage containers',
        displayAmount: `${batch.numberOfContainers}+ meal-sized containers`,
        category: 'equipment',
        note: 'Glass or BPA-free plastic. Label each with date.',
      });
    }
  }

  const deduped = new Map<string, ShoppingListItem>();
  for (const item of items) {
    const key = `${item.category}::${item.name.trim().toLowerCase()}::${item.displayAmount.trim().toLowerCase()}`;
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, item);
      continue;
    }

    if (!existing.note && item.note) {
      deduped.set(key, { ...existing, note: item.note });
    }
  }

  return Array.from(deduped.values());
}

function ingCategoryToShopping(cat: RecipeIngredient['category']): ShoppingListItem['category'] {
  if (cat === 'protein') return 'protein';
  if (cat === 'supplement') return 'supplement';
  if (cat === 'carb') return 'pantry';
  return 'produce';
}

// ── Storage info ──────────────────────────────────────────────────────────────
function buildStorage(recipeType: RecipeType) {
  if (recipeType === 'topper') {
    return {
      fridgeDays: 3,
      freezerMonths: 1,
      thawInstructions: 'Thaw overnight in the refrigerator. Do not thaw at room temperature.',
      servingTemperature: 'Room temperature or slightly warm.',
      portioningNotes: 'Store in a small airtight container. Make small batches — toppers are occasional additions.',
    };
  }
  if (recipeType === 'treat') {
    return {
      fridgeDays: 5,
      freezerMonths: 2,
      thawInstructions: 'Frozen treats can be served directly from the freezer.',
      servingTemperature: 'Room temperature for baked treats. Frozen for frozen treats.',
      portioningNotes: 'Store baked treats in an airtight container at room temperature for up to 5 days, or freeze for longer shelf life.',
    };
  }
  return {
    fridgeDays: 4,
    freezerMonths: 3,
    thawInstructions: 'Thaw frozen portions in the refrigerator overnight. Never microwave — it creates hot spots and can degrade nutrients.',
    servingTemperature: 'Room temperature or slightly warm. Never serve cold from the fridge — let it sit out for 10–15 minutes.',
    portioningNotes: 'Portion into individual meal-sized containers. Label each with the date. Keep the next 3–4 days in the fridge; freeze the rest immediately.',
  };
}

// ── Safety notes builder ───────────────────────────────────────────────────────
function buildSafetyNotes(
  recipeType: RecipeType,
  template: RecipeTemplate,
  dog: DogProfile,
  existingWarnings: string[]
): string[] {
  const notes = [...existingWarnings];

  notes.push('All ingredients have been checked against the common toxic foods list for dogs.');

  if (recipeType === 'full_meal' || recipeType === 'batch_week') {
    notes.push('Homemade dog food usually needs supplementation to be nutritionally complete. See the supplement checklist below.');
    notes.push('Introduce this food gradually over 7–10 days, mixing it with your dog\'s current food and increasing the new food each day.');
  }

  if (recipeType === 'topper') {
    notes.push('This topper is designed to complement your dog\'s regular complete food, not replace it. Serve as an occasional addition.');
    notes.push('The suggested serving amount is approximately 10–15% of your dog\'s daily food intake.');
  }

  if (recipeType === 'treat') {
    notes.push('Treats should make up no more than 10% of your dog\'s daily caloric intake.');
    notes.push('This recipe contains no chocolate, xylitol, grapes, raisins, onion, or garlic.');
  }

  if (dog.lifeStage === 'puppy') {
    notes.push('Puppies have unique nutritional needs. Please consult a veterinarian or veterinary nutritionist before feeding homemade food to your puppy.');
  }

  if (dog.lifeStage === 'senior') {
    notes.push('Senior dogs may have different caloric and nutrient needs. Consider consulting your veterinarian about this recipe.');
  }

  return notes;
}

// ── Transition guide ───────────────────────────────────────────────────────────
const TRANSITION_GUIDE = [
  'Days 1–2: Feed 75% current food + 25% homemade food.',
  'Days 3–4: Feed 50% current food + 50% homemade food.',
  'Days 5–6: Feed 25% current food + 75% homemade food.',
  'Day 7+: Feed 100% homemade food (if no digestive issues).',
  'If your dog shows signs of digestive upset (loose stools, vomiting, excessive gas) at any stage, slow down the transition.',
  'Always consult your veterinarian before starting a homemade diet, especially for puppies, seniors, or dogs with health conditions.',
];

// ── Treat-specific instructions ───────────────────────────────────────────────
const DEFAULT_TREAT_INSTRUCTIONS: CookingStep[] = [
  { stepNumber: 1, instruction: 'Preheat oven to 350°F (175°C) if baking. Line a baking sheet with parchment paper.' },
  { stepNumber: 2, instruction: 'Combine all ingredients in a mixing bowl. Mix until well combined.' },
  { stepNumber: 3, instruction: 'Roll out or drop spoonfuls onto the prepared baking sheet.', tip: 'Smaller treats are better for training — aim for pea-sized pieces.' },
  { stepNumber: 4, instruction: 'Bake for 20–25 minutes until firm and lightly golden. Let cool completely before serving.', durationMinutes: 25 },
  { stepNumber: 5, instruction: 'Store in an airtight container at room temperature for up to 5 days, or freeze for up to 2 months.' },
];

const TREAT_INSTRUCTIONS: Record<string, CookingStep[]> = {
  treat_pb_banana_bites: [
    { stepNumber: 1, instruction: 'Mash one ripe banana in a bowl until smooth.' },
    { stepNumber: 2, instruction: 'Add xylitol-free peanut butter (verify the label!) and mix well.' },
    { stepNumber: 3, instruction: 'Spoon mixture into silicone molds or onto a parchment-lined tray.', tip: 'Ice cube trays work perfectly for portion-sized frozen treats.' },
    { stepNumber: 4, instruction: 'Freeze for at least 2 hours until solid.', durationMinutes: 120 },
    { stepNumber: 5, instruction: 'Store in the freezer in a zip-lock bag. Serve directly from the freezer.' },
  ],
  treat_yogurt_berry_lickmat: [
    { stepNumber: 1, instruction: 'Mix plain Greek yogurt and fresh or thawed blueberries in a bowl. Mash the blueberries slightly.' },
    { stepNumber: 2, instruction: 'Spread the mixture onto your lick mat, or spoon into silicone molds.', tip: 'You can also pipe it into a Kong toy and freeze.' },
    { stepNumber: 3, instruction: 'Freeze for 1–2 hours for a frozen treat, or serve fresh on the lick mat.', durationMinutes: 60 },
    { stepNumber: 4, instruction: 'Store extras in the freezer for up to 2 months.' },
  ],
  treat_sweet_potato_chews: [
    { stepNumber: 1, instruction: 'Wash sweet potatoes thoroughly. Peel if preferred.' },
    { stepNumber: 2, instruction: 'Slice into ¼-inch strips or rounds.' },
    { stepNumber: 3, instruction: 'Option A — Oven: Bake at 250°F (120°C) for 2.5–3 hours, flipping halfway, until chewy.', durationMinutes: 180, tip: 'Lower temperature = chewier result. Higher = crunchier.' },
    { stepNumber: 4, instruction: 'Option B — Dehydrator: Dehydrate at 145°F for 6–8 hours.' },
    { stepNumber: 5, instruction: 'Cool completely. Store in an airtight container in the fridge for up to 2 weeks.' },
  ],
  treat_frozen_kong: [
    { stepNumber: 1, instruction: 'Mash banana and pumpkin together in a bowl until smooth.' },
    { stepNumber: 2, instruction: 'Stir in xylitol-free peanut butter.' },
    { stepNumber: 3, instruction: 'Plug the small hole of the Kong with peanut butter, then stuff the mixture inside.' },
    { stepNumber: 4, instruction: 'Freeze for at least 4 hours or overnight.', durationMinutes: 240 },
    { stepNumber: 5, instruction: 'Serve frozen for a longer-lasting enrichment activity. Store extra filling in the freezer for up to 2 months.' },
  ],
};
