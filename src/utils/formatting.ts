import { gramsToOz, gramsToLbs, gramsToCups } from './calculator';

export function formatGrams(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${Math.round(grams)} g`;
}

export function formatOz(grams: number): string {
  const ounces = gramsToOz(grams);
  if (grams > 0 && ounces === 0) {
    return '<0.01 oz';
  }
  return `${ounces} oz`;
}

export function formatCups(grams: number): string {
  const cups = gramsToCups(grams);
  if (cups < 0.25) return 'a small amount';
  if (cups === 0.25) return '¼ cup';
  if (cups === 0.5) return '½ cup';
  if (cups === 0.75) return '¾ cup';
  if (cups % 1 === 0) return `${cups} cup${cups > 1 ? 's' : ''}`;
  const whole = Math.floor(cups);
  const frac = cups - whole;
  const fracStr = frac === 0.25 ? '¼' : frac === 0.5 ? '½' : '¾';
  return `${whole} ${fracStr} cups`;
}

export function formatLbs(grams: number): string {
  const lbs = gramsToLbs(grams);
  if (lbs < 0.5) return `${formatOz(grams)}`;
  if (lbs === 1) return '1 lb';
  return `${lbs} lbs`;
}

export function formatCalories(cals: number): string {
  return `${Math.round(cals)} kcal`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRecipeType(type: string): string {
  const labels: Record<string, string> = {
    topper: 'Fresh Topper',
    full_meal: 'Full Homemade Meal',
    batch_week: 'Cook Once, Feed All Week',
    pantry: 'Pantry Mode',
    treat: 'Dessert & Treats',
  };
  return labels[type] ?? type;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}
