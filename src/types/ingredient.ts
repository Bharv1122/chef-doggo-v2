import type { IngredientCategory } from './recipe';

export type ToxicityLevel = 'hard_block' | 'warning';

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: IngredientCategory;
  isToxic: boolean;
  toxicityLevel?: ToxicityLevel;
  toxicReason?: string;
  caloriesPerGram: number;
  budgetFriendly: boolean;
  commonAllergen: boolean;
  whyIncluded: string;
  prepNotes: string;
  safetyNotes: string;
  possibleSwaps: string[];
}
