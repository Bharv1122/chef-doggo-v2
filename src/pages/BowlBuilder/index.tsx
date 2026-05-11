import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { RecipeTypeSelector } from '../../components/recipe/RecipeTypeSelector';
import { useRecipes } from '../../hooks/useRecipes';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { generateRecipe } from '../../utils/recipeGenerator';
import { getIngredientsByCategory } from '../../data/ingredients';
import type { RecipeType } from '../../types/recipe';

type BudgetMode = 'standard' | 'budget';

const PROTEINS = getIngredientsByCategory('protein').map(i => ({ value: i.id, label: i.name }));
const CARBS    = getIngredientsByCategory('carb').map(i => ({ value: i.id, label: i.name }));
const VEGS     = getIngredientsByCategory('vegetable').map(i => ({ value: i.id, label: i.name }));

const BUDGET_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'budget',   label: 'Budget-friendly (swap to cheaper ingredients)' },
];

export default function BowlBuilderPage() {
  const navigate = useNavigate();
  const { saveRecipe } = useRecipes();
  const { activeProfile, profiles } = useDogProfiles();

  const [recipeType, setRecipeType] = useState<RecipeType>('full_meal');
  const [protein, setProtein] = useState(PROTEINS[0]?.value ?? '');
  const [carb, setCarb] = useState(CARBS[0]?.value ?? '');
  const [veg, setVeg] = useState(VEGS[0]?.value ?? '');
  const [budget, setBudget] = useState<BudgetMode>('standard');
  const [dogId, setDogId] = useState(activeProfile?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dog = profiles.find(p => p.id === dogId) ?? activeProfile;

  async function handleGenerate() {
    if (!dog) { setError('Please add a dog profile first.'); return; }
    setLoading(true);
    setError('');
    try {
      const recipe = await generateRecipe({
        dog,
        recipeType,
        // Batch recipes always feed for a week. Other types make a single meal.
        batchDuration: recipeType === 'batch_week' ? '7day' : '1day',
        preferredProteinIds: [protein],
        budgetMode: budget === 'budget',
      });
      const saved = await saveRecipe(recipe);
      navigate(`/recipes/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Bowl Builder" backTo="/" />
      <PageWrapper>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#1C1917]">Build Your Bowl</h2>
          <p className="text-sm text-[#78716C] mt-1">Pick your ingredients and Chef Doggo will calculate portions and build the full recipe.</p>
        </div>

        <div className="space-y-4">
          {/* Dog selector */}
          {profiles.length > 0 && (
            <Card>
              <Select
                label="For which dog?"
                value={dogId}
                onChange={e => setDogId(e.target.value)}
                options={profiles.map(p => ({ value: p.id, label: p.name }))}
              />
            </Card>
          )}

          {/* Recipe type */}
          <Card>
            <h3 className="font-semibold text-[#1C1917] text-sm mb-3">What kind of recipe?</h3>
            <RecipeTypeSelector selected={recipeType} onSelect={t => setRecipeType(t)} />
          </Card>

          {/* Ingredient picks */}
          <Card>
            <h3 className="font-semibold text-[#1C1917] text-sm mb-3">Pick Your Ingredients</h3>
            <div className="space-y-3">
              <Select label="Protein" value={protein} onChange={e => setProtein(e.target.value)} options={PROTEINS} />
              {recipeType !== 'topper' && recipeType !== 'treat' && (
                <Select label="Carbohydrate" value={carb} onChange={e => setCarb(e.target.value)} options={CARBS} />
              )}
              <Select label="Vegetable" value={veg} onChange={e => setVeg(e.target.value)} options={VEGS} />
            </div>
          </Card>

          {/* Options */}
          <Card>
            <h3 className="font-semibold text-[#1C1917] text-sm mb-3">Options</h3>
            <div className="space-y-3">
              {recipeType === 'batch_week' && (
                <p className="rounded-lg bg-[#fff7ee] border border-[#f2c8a0] px-3 py-2 text-xs text-[#a16b38]">
                  📦 Batch recipes feed your dog for <strong>7 days</strong>. Chef Doggo will scale everything to a full week.
                </p>
              )}
              <Select label="Budget" value={budget} onChange={e => setBudget(e.target.value as BudgetMode)} options={BUDGET_OPTIONS} />
            </div>
          </Card>

          {!dog && (
            <Disclaimer variant="warning">
              You need a dog profile before generating a recipe. <a href="/profiles/new" className="underline font-medium">Add a dog</a> first.
            </Disclaimer>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
          )}

          <Button fullWidth size="lg" loading={loading} icon={<ChefHat size={18} />} onClick={handleGenerate} disabled={!dog}>
            {loading ? 'Generating recipe & image…' : 'Generate Recipe'}
          </Button>
        </div>
      </PageWrapper>
    </>
  );
}
