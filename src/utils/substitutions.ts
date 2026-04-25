import { getIngredientById } from '../data/ingredients';
import { validateIngredients } from './safetyValidator';
import type { DogProfile } from '../types/dog';
import type { RecipeIngredient } from '../types/recipe';
import type { SafetyResult } from '../types/recipe';

const BUDGET_SWAPS: Record<string, string> = {
  salmon: 'whitefish',
  lamb: 'ground_turkey',
  venison: 'ground_turkey',
  quinoa: 'brown_rice',
  blueberries: 'carrots',
  coconut_oil: 'fish_oil',
};

// Swap one ingredient in a recipe ingredient list
export function swapIngredient(
  ingredients: RecipeIngredient[],
  fromIngredientId: string,
  toIngredientId: string,
  dog?: DogProfile
): { ingredients: RecipeIngredient[]; safety: SafetyResult } {
  const toIngredient = getIngredientById(toIngredientId);
  if (!toIngredient) {
    return {
      ingredients,
      safety: { safe: false, errors: [`Replacement ingredient "${toIngredientId}" not found.`], warnings: [] },
    };
  }

  const updated = ingredients.map(ing => {
    if (ing.ingredientId !== fromIngredientId) return ing;
    return {
      ...ing,
      ingredientId: toIngredient.id,
      name: toIngredient.name,
      prepNote: toIngredient.prepNotes,
    };
  });

  const safety = validateIngredients(updated.map(i => i.name), dog);
  return { ingredients: updated, safety };
}

// Apply budget substitutions to a list of ingredients
export function applyBudgetSwaps(
  ingredients: RecipeIngredient[],
  dog?: DogProfile
): { ingredients: RecipeIngredient[]; swapped: string[]; safety: SafetyResult } {
  let current = [...ingredients];
  const swapped: string[] = [];

  for (const ing of current) {
    const swapId = BUDGET_SWAPS[ing.ingredientId];
    if (swapId) {
      const result = swapIngredient(current, ing.ingredientId, swapId, dog);
      if (result.safety.safe) {
        current = result.ingredients;
        const swapIngredient2 = getIngredientById(swapId);
        swapped.push(`${ing.name} → ${swapIngredient2?.name ?? swapId}`);
      }
    }
  }

  const safety = validateIngredients(current.map(i => i.name), dog);
  return { ingredients: current, swapped, safety };
}

export { BUDGET_SWAPS };
