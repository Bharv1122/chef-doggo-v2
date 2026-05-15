import { readFileSync } from 'node:fs';

const source = readFileSync('src/pages/Recipes/RecipeDetail.tsx', 'utf8');

if (!source.includes("useState<BatchDuration>('1day')")) {
  throw new Error('Recipe detail ingredients batch selector should default to Batch · 1 day.');
}

if (source.includes("useState<BatchDuration>(\n    recipe?.batch.usedFor ?? '7day'\n  )")) {
  throw new Error('Recipe detail ingredients batch selector still defaults to the saved recipe batch duration.');
}

console.log('Recipe detail ingredients batch selector defaults to Batch · 1 day.');
