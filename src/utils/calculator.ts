import type { DogProfile } from '../types/dog';
import type { ServingInfo, BatchInfo, BatchDuration } from '../types/recipe';

// ── RER / DER ─────────────────────────────────────────────────────────────────
// All results are ESTIMATES. Label them clearly in the UI.

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  low: 1.2,
  moderate: 1.4,
  active: 1.6,
  very_active: 1.8,
};

const LIFE_STAGE_MULTIPLIERS: Record<string, number> = {
  puppy: 3.0,   // growing dogs have much higher energy needs
  adult: 1.0,   // uses activity multiplier
  senior: 0.8,  // reduced metabolism
};

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

// Resting Energy Requirement in kcal/day
export function calcRER(weightLbs: number): number {
  if (!Number.isFinite(weightLbs) || weightLbs <= 0) return 0;
  const kg = lbsToKg(weightLbs);
  return 70 * Math.pow(kg, 0.75);
}

// Daily Energy Requirement in kcal/day
export function calcDER(dog: DogProfile): number {
  const rer = calcRER(dog.weightLbs);
  if (dog.lifeStage === 'puppy') return rer * LIFE_STAGE_MULTIPLIERS.puppy;
  if (dog.lifeStage === 'senior') return rer * LIFE_STAGE_MULTIPLIERS.senior;
  return rer * (ACTIVITY_MULTIPLIERS[dog.activityLevel] ?? 1.4);
}

// Convert daily calories to grams of food
// kcalPerGram varies by recipe fat content; 1.1 is a reasonable average for balanced homemade
export function calsToGrams(calories: number, kcalPerGram = 1.1): number {
  if (!Number.isFinite(calories) || calories <= 0) return 0;
  if (!Number.isFinite(kcalPerGram) || kcalPerGram <= 0) return 0;
  return Math.round(calories / kcalPerGram);
}

// ── Serving info ──────────────────────────────────────────────────────────────
export function calcServing(dog: DogProfile, kcalPerGram = 1.1): ServingInfo {
  const dailyCals = calcDER(dog);
  const dailyGrams = calsToGrams(dailyCals, kcalPerGram);
  const gramsPerMeal = Math.round(dailyGrams / dog.mealsPerDay);
  const cupsPerMeal = Math.round((gramsPerMeal / 240) * 10) / 10; // rough ~240g per cup

  return {
    gramsPerMeal,
    cupsPerMeal,
    mealsPerDay: dog.mealsPerDay,
    totalDailyGrams: dailyGrams,
  };
}

// ── Batch info ────────────────────────────────────────────────────────────────
export function calcBatch(serving: ServingInfo, duration: BatchDuration): BatchInfo {
  const days = duration === '1day' ? 1 : duration === '3day' ? 3 : 7;
  const totalYieldGrams = serving.totalDailyGrams * days;
  const totalMeals = serving.mealsPerDay * days;
  const mealsPerContainer = serving.mealsPerDay; // one container per day
  const numberOfContainers = days;

  let fridgeMeals: number;
  let freezerMeals: number;

  if (days <= 3) {
    fridgeMeals = totalMeals;
    freezerMeals = 0;
  } else {
    // 7-day batch: keep 3 days fridge, freeze 4 days
    fridgeMeals = serving.mealsPerDay * 3;
    freezerMeals = serving.mealsPerDay * 4;
  }

  return {
    totalYieldGrams,
    numberOfMeals: totalMeals,
    numberOfContainers,
    fridgeMeals,
    freezerMeals,
    usedFor: duration,
  };
}

// ── Ingredient amounts from proportions ───────────────────────────────────────
export interface IngredientAmounts {
  proteinGrams: number;
  carbGrams: number;
  vegGrams: number;
  fatGrams: number;
}

// Rough macronutrient split by weight for a balanced homemade recipe
export function splitIngredients(totalGrams: number): IngredientAmounts {
  return {
    proteinGrams: Math.round(totalGrams * 0.40),
    carbGrams: Math.round(totalGrams * 0.30),
    vegGrams: Math.round(totalGrams * 0.20),
    fatGrams: Math.round(totalGrams * 0.10),
  };
}

// ── Unit helpers ───────────────────────────────────────────────────────────────
export function gramsToOz(grams: number): number {
  return Math.round((grams / 28.35) * 10) / 10;
}

export function gramsToLbs(grams: number): number {
  return Math.round((grams / 453.592) * 10) / 10;
}

// Grocery-friendly label (e.g. 453g → "about 1 lb")
export function groceryLabel(grams: number, ingredientName: string): string {
  const lbs = grams / 453.592;
  const oz = grams / 28.35;

  if (lbs >= 1.8) return `about ${Math.round(lbs)} lbs ${ingredientName}`;
  if (lbs >= 0.9) return `about 1 lb ${ingredientName}`;
  if (lbs >= 0.4) return `about ½ lb ${ingredientName}`;
  if (oz >= 10) return `about ${Math.round(oz)} oz ${ingredientName}`;
  return `about ${Math.round(grams)}g ${ingredientName}`;
}

// Rough cups conversion (varies by ingredient density)
export function gramsToCups(grams: number): number {
  return Math.round((grams / 240) * 4) / 4; // round to nearest ¼ cup
}
