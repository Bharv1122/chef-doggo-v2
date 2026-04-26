import { getIngredientById } from '../data/ingredients';
import type { Recipe } from '../types/recipe';

export type RecipePhotoKind = 'chicken' | 'beef' | 'fish' | 'veggie' | 'treats';
export type CommonAllergen = 'chicken' | 'beef' | 'dairy' | 'wheat' | 'soy' | 'eggs';

interface RecipePhotoMeta {
  kind: RecipePhotoKind;
  label: string;
  emoji: string;
  alt: string;
  colors: {
    start: string;
    end: string;
    accent: string;
  };
}

const PHOTO_META: Record<RecipePhotoKind, RecipePhotoMeta> = {
  chicken: {
    kind: 'chicken',
    label: 'Chicken Recipe',
    emoji: '🍗',
    alt: 'Chicken-based homemade dog food bowl',
    colors: { start: '#FDE68A', end: '#FB923C', accent: '#FFFBEB' },
  },
  beef: {
    kind: 'beef',
    label: 'Beef Recipe',
    emoji: '🥩',
    alt: 'Beef-based homemade dog food bowl',
    colors: { start: '#FCA5A5', end: '#DC2626', accent: '#FEE2E2' },
  },
  fish: {
    kind: 'fish',
    label: 'Fish Recipe',
    emoji: '🐟',
    alt: 'Fish-based homemade dog food bowl',
    colors: { start: '#93C5FD', end: '#1D4ED8', accent: '#DBEAFE' },
  },
  veggie: {
    kind: 'veggie',
    label: 'Veggie Recipe',
    emoji: '🥕',
    alt: 'Vegetable-forward homemade dog food bowl',
    colors: { start: '#86EFAC', end: '#15803D', accent: '#DCFCE7' },
  },
  treats: {
    kind: 'treats',
    label: 'Treat Recipe',
    emoji: '🦴',
    alt: 'Homemade dog treats on a plate',
    colors: { start: '#FDBA74', end: '#C2410C', accent: '#FFEDD5' },
  },
};

const ALLERGEN_RULES: Array<{ allergen: CommonAllergen; pattern: RegExp }> = [
  { allergen: 'chicken', pattern: /chicken|turkey/ },
  { allergen: 'beef', pattern: /beef|lamb|venison/ },
  { allergen: 'dairy', pattern: /dairy|milk|cheese|yogurt|butter|cream/ },
  { allergen: 'wheat', pattern: /wheat|flour|barley|gluten/ },
  { allergen: 'soy', pattern: /soy/ },
  { allergen: 'eggs', pattern: /egg\b|eggs\b|eggshell/ },
];

const RECIPE_CLASSIFIER_RULES: Array<{ kind: RecipePhotoKind; pattern: RegExp }> = [
  { kind: 'fish', pattern: /salmon|whitefish|sardine|fish|cod|tilapia|pollock|haddock/ },
  { kind: 'beef', pattern: /beef|lamb|venison/ },
  { kind: 'chicken', pattern: /chicken|turkey|egg/ },
];

const PHOTO_CACHE = new Map<RecipePhotoKind, string>();

function buildPhotoDataUri(meta: RecipePhotoMeta): string {
  const svg = `<svg xmlns="https://i.ytimg.com/vi/6Eprseh2k5k/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AHYCIAC0AWKAgwIABABGEIgUyhyMA8=&rs=AOn4CLD4O8gcUeajA4vCDUZEd4Jtdq7eLw" viewBox="0 0 1200 800" role="img" aria-label="${meta.alt}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${meta.colors.start}" />
        <stop offset="100%" stop-color="${meta.colors.end}" />
      </linearGradient>
      <radialGradient id="shine" cx="0.25" cy="0.15" r="0.7">
        <stop offset="0%" stop-color="${meta.colors.accent}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="${meta.colors.accent}" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect width="1200" height="800" fill="url(#bg)" />
    <rect width="1200" height="800" fill="url(#shine)" />

    <ellipse cx="600" cy="620" rx="340" ry="120" fill="rgba(0,0,0,0.18)" />
    <circle cx="600" cy="400" r="250" fill="rgba(255,255,255,0.9)" />
    <circle cx="600" cy="400" r="185" fill="rgba(255,255,255,0.62)" />

    <text x="600" y="438" text-anchor="middle" font-size="230">${meta.emoji}</text>
    <text x="600" y="690" text-anchor="middle" fill="#ffffff" font-size="56" font-family="Arial, sans-serif" font-weight="700">${meta.label}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getRecipeClassifierText(recipe: Recipe): string {
  const rawValues = recipe.ingredients.flatMap(ingredient => {
    const item = getIngredientById(ingredient.ingredientId);
    return [ingredient.ingredientId, ingredient.name, item?.name ?? '', ...(item?.aliases ?? [])];
  });

  return rawValues.join(' ').toLowerCase();
}

function classifyPhotoKind(recipe: Recipe): RecipePhotoKind {
  if (recipe.type === 'treat') {
    return 'treats';
  }

  const classifierText = getRecipeClassifierText(recipe);

  const matchedRule = RECIPE_CLASSIFIER_RULES.find(rule => rule.pattern.test(classifierText));
  return matchedRule?.kind ?? 'veggie';
}

export function getRecipePhoto(recipe: Recipe): { src: string; alt: string; kind: RecipePhotoKind; label: string } {
  const kind = classifyPhotoKind(recipe);
  const meta = PHOTO_META[kind];

  if (!PHOTO_CACHE.has(kind)) {
    PHOTO_CACHE.set(kind, buildPhotoDataUri(meta));
  }

  return {
    src: PHOTO_CACHE.get(kind)!,
    alt: meta.alt,
    kind,
    label: meta.label,
  };
}

export function detectRecipeAllergens(recipe: Recipe): CommonAllergen[] {
  const ingredientText = getRecipeClassifierText(recipe);

  const found = ALLERGEN_RULES
    .filter(rule => rule.pattern.test(ingredientText))
    .map(rule => rule.allergen);

  return Array.from(new Set(found));
}

export function getNutritionMacroBreakdown(recipe: Recipe): Array<{ key: 'protein' | 'fat' | 'carb'; label: string; calories: number; percentage: number }> {
  const caloriesByMacro = {
    protein: 0,
    fat: 0,
    carb: 0,
  };

  for (const ingredient of recipe.ingredients) {
    const source = getIngredientById(ingredient.ingredientId);
    const caloriesPerGram = source?.caloriesPerGram ?? 0;

    if (caloriesPerGram <= 0 || !Number.isFinite(caloriesPerGram)) continue;

    const calories = ingredient.amountGrams * caloriesPerGram;

    if (ingredient.category === 'protein') {
      caloriesByMacro.protein += calories;
      continue;
    }

    if (ingredient.category === 'fat') {
      caloriesByMacro.fat += calories;
      continue;
    }

    if (ingredient.category === 'carb' || ingredient.category === 'vegetable' || ingredient.category === 'treat') {
      caloriesByMacro.carb += calories;
    }
  }

  const totalCalories = caloriesByMacro.protein + caloriesByMacro.fat + caloriesByMacro.carb;

  const defaultBreakdown = [
    { key: 'protein' as const, label: 'Protein', calories: 0, percentage: 40 },
    { key: 'fat' as const, label: 'Fat', calories: 0, percentage: 30 },
    { key: 'carb' as const, label: 'Carbs', calories: 0, percentage: 30 },
  ];

  if (totalCalories <= 0) {
    return defaultBreakdown;
  }

  const entries = [
    { key: 'protein' as const, label: 'Protein', calories: caloriesByMacro.protein, percentage: 0 },
    { key: 'fat' as const, label: 'Fat', calories: caloriesByMacro.fat, percentage: 0 },
    { key: 'carb' as const, label: 'Carbs', calories: caloriesByMacro.carb, percentage: 0 },
  ];

  entries.forEach(entry => {
    entry.percentage = Math.round((entry.calories / totalCalories) * 100);
  });

  const percentageTotal = entries.reduce((sum, entry) => sum + entry.percentage, 0);
  if (percentageTotal !== 100) {
    const indexWithMostCalories = entries.reduce((best, current, index, arr) =>
      current.calories > arr[best].calories ? index : best
    , 0);

    entries[indexWithMostCalories].percentage += 100 - percentageTotal;
  }

  return entries;
}
