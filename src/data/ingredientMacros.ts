// Share of an ingredient's calories that comes from each macronutrient.
// The three values sum to ~1.
//
// The ingredient catalog (ingredients.ts) stores only total calories, so
// without this a fatty protein like salmon would have 100% of its calories
// counted as protein — see getNutritionMacroBreakdown in recipeInsights.ts.
// These are rough cooked-weight estimates for planning only, not lab values.
export interface MacroSplit {
  protein: number;
  fat: number;
  carb: number;
}

const INGREDIENT_MACROS: Record<string, MacroSplit> = {
  // proteins
  chicken_breast: { protein: 0.8, fat: 0.2, carb: 0 },
  ground_turkey: { protein: 0.58, fat: 0.42, carb: 0 },
  ground_beef_lean: { protein: 0.5, fat: 0.5, carb: 0 },
  salmon: { protein: 0.45, fat: 0.55, carb: 0 },
  whitefish: { protein: 0.85, fat: 0.15, carb: 0 },
  sardines_canned: { protein: 0.48, fat: 0.52, carb: 0 },
  eggs: { protein: 0.35, fat: 0.62, carb: 0.03 },
  lamb: { protein: 0.32, fat: 0.68, carb: 0 },
  venison: { protein: 0.82, fat: 0.18, carb: 0 },
  // carbs
  white_rice: { protein: 0.08, fat: 0.02, carb: 0.9 },
  brown_rice: { protein: 0.08, fat: 0.07, carb: 0.85 },
  sweet_potato: { protein: 0.07, fat: 0.03, carb: 0.9 },
  oats: { protein: 0.13, fat: 0.16, carb: 0.71 },
  pumpkin: { protein: 0.1, fat: 0.07, carb: 0.83 },
  barley: { protein: 0.09, fat: 0.04, carb: 0.87 },
  quinoa: { protein: 0.15, fat: 0.15, carb: 0.7 },
  // vegetables
  carrots: { protein: 0.08, fat: 0.04, carb: 0.88 },
  green_beans: { protein: 0.2, fat: 0.05, carb: 0.75 },
  zucchini: { protein: 0.22, fat: 0.1, carb: 0.68 },
  peas: { protein: 0.22, fat: 0.05, carb: 0.73 },
  broccoli: { protein: 0.26, fat: 0.08, carb: 0.66 },
  spinach: { protein: 0.35, fat: 0.12, carb: 0.53 },
  kale: { protein: 0.2, fat: 0.12, carb: 0.68 },
  blueberries: { protein: 0.04, fat: 0.05, carb: 0.91 },
  // fats
  coconut_oil: { protein: 0, fat: 1, carb: 0 },
  // treats
  peanut_butter: { protein: 0.16, fat: 0.72, carb: 0.12 },
  banana: { protein: 0.05, fat: 0.03, carb: 0.92 },
  apple: { protein: 0.02, fat: 0.03, carb: 0.95 },
  plain_greek_yogurt: { protein: 0.5, fat: 0.25, carb: 0.25 },
  sunflower_butter: { protein: 0.12, fat: 0.76, carb: 0.12 },
  // supplements (eggshell / calcium carry 0 kcal, so the split never applies)
  fish_oil: { protein: 0, fat: 1, carb: 0 },
  eggshell_powder: { protein: 0, fat: 0, carb: 1 },
  calcium_carbonate: { protein: 0, fat: 0, carb: 1 },
};

// Fallback when an ingredient id is not in the catalog — e.g. chat-extracted
// recipes whose ids are not canonical.
const CATEGORY_DEFAULTS: Record<string, MacroSplit> = {
  protein: { protein: 0.55, fat: 0.45, carb: 0 },
  carb: { protein: 0.1, fat: 0.07, carb: 0.83 },
  vegetable: { protein: 0.2, fat: 0.08, carb: 0.72 },
  fat: { protein: 0, fat: 1, carb: 0 },
  supplement: { protein: 0, fat: 1, carb: 0 },
  treat: { protein: 0.12, fat: 0.45, carb: 0.43 },
};

const GENERIC_DEFAULT: MacroSplit = { protein: 0.3, fat: 0.25, carb: 0.45 };

export function getIngredientMacroSplit(ingredientId: string, category: string): MacroSplit {
  return INGREDIENT_MACROS[ingredientId] ?? CATEGORY_DEFAULTS[category] ?? GENERIC_DEFAULT;
}
