import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Play, ShoppingBag, Timer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { useRecipes } from '../../hooks/useRecipes';

const DEFAULT_RECIPE = {
  id: 'sample',
  name: 'Turkey & Sweet Potato Bowl',
  description: 'A wholesome, gentle recipe packed with lean protein, fiber, and vitamins to support your dog\'s energy and overall health.',
  type: 'batch_week' as const,
  ingredients: [
    'Ground Turkey (93% lean) — about 3 lbs',
    'Sweet Potato (peeled, diced) — about 2 lbs',
    'Brown Rice (uncooked) — about 2 lbs',
    'Green Peas (frozen) — about ½ lb',
    'Carrots (diced) — about ½ lb',
    'Olive Oil — 2 tbsp',
    'Egg — 2 large',
  ],
  steps: [
    'Cook the rice according to package instructions. Set aside.',
    'Add diced sweet potato and carrots to a pot with water and simmer 10–12 minutes.',
    'Cook ground turkey in a skillet until no longer pink. Drain excess fat.',
    'Combine cooked rice, sweet potato, carrots, and peas. Stir well.',
    'Add eggs and olive oil. Mix thoroughly until everything is combined.',
    'Let cool completely before serving. Divide into 14 meal-sized portions (about 1 cup each).',
    'Refrigerate 3–4 days\' worth. Freeze the rest in airtight containers labeled with the date.',
    'Thaw frozen portions overnight in the fridge. Serve at room temperature.',
  ],
  stats: {
    lifeStage: 'Adult',
    portionSize: '1 cup',
    caloriesPerCup: 420,
    prepTime: 15,
    cookTime: 35,
    batchYieldCups: 14,
  },
  nutrition: {
    calories: 420,
    protein: 27,
    proteinPct: 26,
    fat: 16,
    fatPct: 34,
    carbs: 36,
    carbsPct: 34,
    fiber: 3,
    fiberPct: 3,
  },
};

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRecipe, toggleFavorite } = useRecipes();

  const recipe = id ? getRecipe(id) : undefined;

  const title = recipe?.name ?? DEFAULT_RECIPE.name;
  const description = recipe?.description ?? DEFAULT_RECIPE.description;

  const ingredients = recipe
    ? recipe.ingredients.map(i => `${i.name} — ${i.groceryFriendlyAmount}`)
    : DEFAULT_RECIPE.ingredients;

  const instructions = recipe
    ? recipe.instructions.map(step => step.instruction)
    : DEFAULT_RECIPE.steps;

  // ── Compute real stats from recipe data ──────────────────────────────────
  const batchYieldCups = recipe
    ? Math.round((recipe.batch.totalYieldGrams / 240) * 10) / 10
    : DEFAULT_RECIPE.stats.batchYieldCups;

  const caloriesPerCup = recipe
    ? recipe.nutrition.caloriesPerServing
    : DEFAULT_RECIPE.stats.caloriesPerCup;

  const prepTime = recipe
    ? recipe.instructions.find(s => s.stepNumber === 1)?.durationMinutes ?? 15
    : DEFAULT_RECIPE.stats.prepTime;

  const cookTime = recipe
    ? recipe.instructions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) || 35
    : DEFAULT_RECIPE.stats.cookTime;

  const lifeStage = recipe
    ? (recipe as any).lifeStage ?? 'Adult'
    : DEFAULT_RECIPE.stats.lifeStage;

  const recipeType = recipe?.type ?? DEFAULT_RECIPE.type;
  const isBatch = recipeType === 'batch_week';
  const batchLabel = isBatch
    ? `${batchYieldCups} cups (~${Math.round(batchYieldCups / 2)} days)`
    : `${batchYieldCups} cups`;

  return (
    <AppShell
      active="recipes"
      rightRail={
        <>
          <section className="doggo-card p-5">
            <div className="flex items-center gap-3">
              <img src="/chef-doggo-logo.webp" alt="Chef Doggo mascot" className="h-16 w-16 rounded-2xl border border-[#eadfce] bg-[#fff4ea] object-contain p-1" />
              <div>
                <h3 className="text-[1.4rem] font-semibold">Chef Doggo's Tip 🐾</h3>
                <p className="mt-1 text-sm text-[#7e7369]">Sweet potatoes are a great source of fiber and vitamin A. Dice them small for even cooking.</p>
              </div>
            </div>
          </section>

          <section className="doggo-card p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.25rem] font-semibold">Shopping List</h4>
              <button className="text-sm font-semibold text-[#f97316]">Add All to List</button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[#6f6459]">
              {ingredients.map(item => (
                <li key={item} className="rounded-xl border border-[#eadfce] bg-white px-3 py-2">{item}</li>
              ))}
            </ul>
          </section>

          <section className="doggo-card p-5">
            <h4 className="text-[1.25rem] font-semibold">Nutrition (per cup)</h4>
            <div className="mt-3 rounded-2xl border border-[#eadfce] bg-white p-4">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-8 border-[#f7d09f] text-center">
                <div>
                  <p className="text-2xl font-bold">{caloriesPerCup}</p>
                  <p className="text-xs text-[#8b8378]">kcal</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-[#6f6459]">
                <li>Protein: {DEFAULT_RECIPE.nutrition.protein}g ({DEFAULT_RECIPE.nutrition.proteinPct}%)</li>
                <li>Fat: {DEFAULT_RECIPE.nutrition.fat}g ({DEFAULT_RECIPE.nutrition.fatPct}%)</li>
                <li>Carbs: {DEFAULT_RECIPE.nutrition.carbs}g ({DEFAULT_RECIPE.nutrition.carbsPct}%)</li>
                <li>Fiber: {DEFAULT_RECIPE.nutrition.fiber}g ({DEFAULT_RECIPE.nutrition.fiberPct}%)</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border border-[#d6ebda] bg-[#f2fbf4] p-5 text-sm text-[#4c8b61]">
            <h4 className="font-semibold">Vet Note ✅</h4>
            <p className="mt-2 text-xs leading-relaxed text-[#5f8b6a]">This recipe is balanced for adult maintenance. Always consult your veterinarian before making diet changes.</p>
          </section>
        </>
      }
    >
      <button onClick={() => navigate('/recipes')} className="mb-3 text-sm font-semibold text-[#7e7369]">← Back to Recipes</button>

      <section className="doggo-card overflow-hidden p-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="grid h-[320px] place-items-center rounded-3xl bg-[#fff0de] text-7xl">🍲</div>
            <button
              className={[
                'mt-3 rounded-full px-4 py-1 text-sm font-semibold',
                recipe?.isFavorite ? 'bg-[#f97316] text-white' : 'bg-[#fff4ea] text-[#f97316]',
              ].join(' ')}
              onClick={() => id && void toggleFavorite(id)}
            >
              ⭐ {recipe?.isFavorite ? 'Favorited' : 'Favorite'}
            </button>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[2.4rem] leading-tight font-semibold text-[#2b2118]">{title}</h1>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-[#7d7268]">{description}</p>
              </div>
              <button
                className={recipe?.isFavorite ? 'mt-2 text-[#f97316]' : 'mt-2 text-[#d9cdbc]'}
                onClick={() => id && void toggleFavorite(id)}
                aria-label="Toggle recipe favorite"
              >
                <Heart fill={recipe?.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f4eef9] p-3 text-sm"><p className="font-semibold">Life Stage</p><p className="text-[#7f7469]">{lifeStage}</p></div>
              <div className="rounded-2xl bg-[#fff4ea] p-3 text-sm"><p className="font-semibold">Portion Size</p><p className="text-[#7f7469]">{recipe?.serving.cupsPerMeal ?? 1} cup</p></div>
              <div className="rounded-2xl bg-[#fff0f0] p-3 text-sm"><p className="font-semibold">Calories/Cup</p><p className="text-[#7f7469]">{caloriesPerCup} kcal</p></div>
              <div className="rounded-2xl bg-[#eef8ee] p-3 text-sm"><p className="font-semibold">Prep Time</p><p className="text-[#7f7469]">{prepTime} min</p></div>
              <div className="rounded-2xl bg-[#fff4ea] p-3 text-sm"><p className="font-semibold">Cook Time</p><p className="text-[#7f7469]">{cookTime} min</p></div>
              <div className="rounded-2xl bg-[#edf4ff] p-3 text-sm"><p className="font-semibold">Batch Yield</p><p className="text-[#7f7469]">{batchLabel}</p></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button icon={<Play size={15} />} onClick={() => navigate(`/cook/${id ?? 'sample'}`)}>Start Cooking</Button>
              <Button variant="secondary" icon={<Timer size={15} />}>Start Voice Cooking</Button>
              <Button variant="secondary" icon={<ShoppingBag size={15} />}>View Full List</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="doggo-card p-5">
          <h2 className="text-[1.35rem] font-semibold">Ingredients</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#6f6459]">
            {ingredients.map(item => (
              <li key={item} className="rounded-xl border border-[#eadfce] bg-white px-3 py-2">{item}</li>
            ))}
          </ul>
          <button className="mt-3 rounded-xl border border-[#f2c8a0] px-4 py-2 text-sm font-semibold text-[#f97316]">Customize Ingredients</button>
        </article>

        <article className="doggo-card p-5">
          <h2 className="text-[1.35rem] font-semibold">Step-by-Step Instructions</h2>
          <ol className="mt-3 space-y-3">
            {instructions.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#6f6459]">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f97316] text-xs font-semibold text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-[#dce9ff] bg-[#f2f7ff] p-3 text-sm text-[#5574a8]">❄️ Freezer tip: Portion into airtight containers for up to 3 months.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="doggo-card p-5">
          <h3 className="text-[1.2rem] font-semibold">Storage Instructions</h3>
          <p className="mt-2 text-sm text-[#6f6459]">Refrigerator: store in an airtight container up to {recipe?.storage.fridgeDays ?? 4} days.</p>
          <p className="mt-1 text-sm text-[#6f6459]">Freezer: freeze in 1-cup portions for up to {recipe?.storage.freezerMonths ?? 3} months.</p>
          <p className="mt-1 text-sm text-[#6f6459]">{recipe?.storage.thawInstructions ?? 'Thaw overnight in the refrigerator before serving.'}</p>
          {isBatch && (
            <p className="mt-2 text-sm font-medium text-[#f97316]">
              🧊 This batch makes {batchYieldCups} cups — keep {Math.min(Math.round(batchYieldCups / 7 * 3), Math.round(batchYieldCups))} cups in the fridge, freeze the rest.
            </p>
          )}
        </article>

        <article className="doggo-card p-5">
          <h3 className="text-[1.2rem] font-semibold">Substitution Suggestions</h3>
          <div className="mt-3 space-y-2 text-sm text-[#6f6459]">
            <div className="rounded-xl border border-[#eadfce] bg-white p-2">Ground Turkey → Ground Chicken or Lean Beef</div>
            <div className="rounded-xl border border-[#eadfce] bg-white p-2">Brown Rice → Quinoa or Oats</div>
            <div className="rounded-xl border border-[#eadfce] bg-white p-2">Sweet Potato → Butternut Squash or Pumpkin</div>
          </div>
        </article>
      </section>

      <section className="mt-4 doggo-soft-card p-4 text-center text-sm text-[#746a5f]">
        Real ingredients • Paw separators • Smart portions • Happy, healthy dogs • Made with love 🧡
      </section>
    </AppShell>
  );
}
