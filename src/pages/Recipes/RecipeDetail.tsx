import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Printer,
  Play,
  DollarSign,
  Package,
  Thermometer,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { ChefDoggoCheck } from '../../components/recipe/ChefDoggoCheck';
import { SupplementChecklist } from '../../components/supplements/SupplementChecklist';
import { ShoppingList } from '../../components/shopping/ShoppingList';
import { IngredientCard } from '../../components/ingredients/IngredientCard';
import { NutritionBreakdownChart } from '../../components/recipe/NutritionBreakdownChart';
import { useRecipes } from '../../hooks/useRecipes';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { applyBudgetSwaps, swapIngredient } from '../../utils/substitutions';
import { formatRecipeType, formatCalories } from '../../utils/formatting';
import { detectRecipeAllergens, getRecipePhoto, type CommonAllergen } from '../../utils/recipeInsights';

const SCALE_OPTIONS = [1, 2, 3, 4] as const;

const ALLERGEN_LABELS: Record<CommonAllergen, string> = {
  chicken: 'Chicken',
  beef: 'Beef',
  dairy: 'Dairy',
  wheat: 'Wheat',
  soy: 'Soy',
  eggs: 'Eggs',
};

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipe, toggleFavorite, updateRecipe } = useRecipes();
  const { getProfile } = useDogProfiles();

  const recipe = getRecipe(id!);
  const [activeTab, setActiveTab] = useState<'recipe' | 'shopping' | 'supplements'>('recipe');
  const [scale, setScale] = useState<1 | 2 | 3 | 4>(1);
  const [budgetApplied, setBudgetApplied] = useState(false);
  const [swapNotice, setSwapNotice] = useState<string[]>([]);

  if (!recipe) {
    return (
      <>
        <Header title="Recipe Not Found" backTo="/recipes" />
        <PageWrapper>
          <p className="text-[#78716C] text-sm">This recipe could not be found.</p>
        </PageWrapper>
      </>
    );
  }

  const dog = getProfile(recipe.dogProfileId);
  const recipePhoto = getRecipePhoto(recipe);
  const allergens = detectRecipeAllergens(recipe);

  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amountGrams: Math.round(ingredient.amountGrams * scale),
    amountCups: ingredient.amountCups ? Math.round(ingredient.amountCups * scale * 4) / 4 : undefined,
    amountOz: ingredient.amountOz ? Math.round(ingredient.amountOz * scale * 10) / 10 : undefined,
    groceryFriendlyAmount: `${scale > 1 ? `${scale}× ` : ''}${ingredient.groceryFriendlyAmount}`,
  }));

  const scaledServing = {
    ...recipe.serving,
    gramsPerMeal: Math.round(recipe.serving.gramsPerMeal * scale),
    cupsPerMeal: Math.round(recipe.serving.cupsPerMeal * scale * 10) / 10,
    totalDailyGrams: Math.round(recipe.serving.totalDailyGrams * scale),
  };

  const scaledNutrition = {
    caloriesPerServing: Math.round(recipe.nutrition.caloriesPerServing * scale),
    caloriesPerDay: Math.round(recipe.nutrition.caloriesPerDay * scale),
  };

  const quickStats = recipe.type === 'treat'
    ? [
        { label: 'Treat cap/day (10%)', value: formatCalories(recipe.nutrition.caloriesPerDay) },
        { label: 'Treat cap/serving', value: formatCalories(recipe.nutrition.caloriesPerServing) },
        { label: 'Daily treat grams', value: `${recipe.serving.totalDailyGrams}g` },
      ]
    : [
        { label: 'Per meal', value: `${scaledServing.cupsPerMeal}c` },
        { label: 'Daily cals', value: formatCalories(scaledNutrition.caloriesPerDay) },
        { label: 'Meals/day', value: String(recipe.serving.mealsPerDay) },
      ];

  const handleMakeCheaper = () => {
    if (budgetApplied) return;

    const result = applyBudgetSwaps(recipe.ingredients, dog);

    if (result.swapped.length > 0) {
      updateRecipe(recipe.id, { ingredients: result.ingredients, updatedAt: new Date().toISOString() });
      setSwapNotice(result.swapped);
      setBudgetApplied(true);
      return;
    }

    setSwapNotice(['This recipe is already using budget-friendly ingredients!']);
    setBudgetApplied(true);
  };

  const handleSwap = (fromId: string, toId: string) => {
    const result = swapIngredient(recipe.ingredients, fromId, toId, dog);

    if (result.safety.safe) {
      updateRecipe(recipe.id, { ingredients: result.ingredients, updatedAt: new Date().toISOString() });
      return;
    }

    alert(result.safety.errors.join('\n'));
  };

  const tabs = [
    { id: 'recipe' as const, label: 'Recipe' },
    { id: 'shopping' as const, label: '🛒 Shopping' },
    ...(recipe.supplements.length > 0 ? [{ id: 'supplements' as const, label: '💊 Supplements' }] : []),
  ];

  return (
    <>
      <Header
        title={recipe.name}
        backTo="/recipes"
        backLabel="Recipes"
        actions={
          <button onClick={() => toggleFavorite(recipe.id)} className="p-2 rounded-lg hover:bg-[#FDF6E9] transition-colors">
            <Heart size={20} className={recipe.isFavorite ? 'fill-[#F97316] text-[#F97316]' : 'text-[#A8A29E]'} />
          </button>
        }
      />

      <PageWrapper>
        <Card className="mb-4 overflow-hidden" padding="none">
          <div className="relative h-56 sm:h-64 w-full">
            <img src={recipePhoto.src} alt={recipePhoto.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <p className="absolute bottom-3 left-3 text-xs font-semibold text-white/95 tracking-wide">{recipePhoto.label}</p>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="orange">{formatRecipeType(recipe.type)}</Badge>
                  {dog && <Badge variant="gray">{dog.name}</Badge>}
                </div>
                <h1 className="text-lg font-bold text-[#1C1917] leading-snug">{recipe.name}</h1>
                <p className="text-sm text-[#78716C] mt-1">{recipe.description}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {quickStats.map(stat => (
                <div key={stat.label} className="bg-[#FDF6E9] rounded-xl p-2.5">
                  <p className="text-sm font-bold text-[#1C1917]">{stat.value}</p>
                  <p className="text-xs text-[#78716C]">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-[#A8A29E] mt-2 italic">
              {recipe.type === 'treat'
                ? 'Treat stats reflect the recommended 10% daily treat-calorie cap.'
                : 'All values are estimates'}
            </p>

            {allergens.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={16} /> Allergen Warning
                </p>
                <p className="text-xs text-red-700 mt-1">
                  This recipe contains potential allergens:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allergens.map(allergen => (
                    <Badge key={allergen} variant="red">{ALLERGEN_LABELS[allergen]}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button icon={<Play size={15} />} onClick={() => navigate(`/cook/${recipe.id}`)}>Cook Mode</Button>
              <Button variant="secondary" icon={<DollarSign size={15} />} onClick={handleMakeCheaper} disabled={budgetApplied}>
                {budgetApplied ? 'Budget Applied' : 'Make It Cheaper'}
              </Button>
              <Button variant="secondary" icon={<Printer size={15} />} onClick={() => navigate(`/vet-export/${recipe.id}`)}>
                Vet Export
              </Button>
              <Button variant="secondary" icon={<ShoppingCart size={15} />} onClick={() => setActiveTab('shopping')}>
                Shopping List
              </Button>
            </div>

            {swapNotice.length > 0 && (
              <div className="mt-3 rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-800 space-y-1">
                <p className="font-semibold">Budget swaps applied:</p>
                {swapNotice.map((swap, index) => <p key={index}>• {swap}</p>)}
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-medium text-[#78716C] mb-2">Scale recipe:</p>
              <div className="flex gap-2">
                {SCALE_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setScale(option)}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                      scale === option ? 'bg-[#F97316] border-[#F97316] text-white' : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]',
                    ].join(' ')}
                  >
                    {option}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-4">
          <ChefDoggoCheck recipe={recipe} warnings={recipe.safetyNotes.slice(0, 3)} />
        </div>

        <div className="flex border-b border-[#E7E5E4] mb-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
                activeTab === tab.id ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'recipe' && (
          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-[#1C1917] mb-3">Nutritional Breakdown</h2>
              <NutritionBreakdownChart recipe={recipe} />
            </Card>

            <Card>
              <h2 className="font-semibold text-[#1C1917] mb-3">Ingredients</h2>
              <div className="space-y-2">
                {scaledIngredients.map(ingredient => (
                  <IngredientCard
                    key={ingredient.ingredientId}
                    ingredient={ingredient}
                    onSwap={toId => handleSwap(ingredient.ingredientId, toId)}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-[#1C1917] mb-3">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map(step => (
                  <li key={step.stepNumber} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#F97316] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1C1917] leading-relaxed">{step.instruction}</p>
                      {step.durationMinutes && (
                        <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">~{step.durationMinutes} min</span>
                      )}
                      {step.tip && (
                        <p className="mt-1 text-xs text-[#78716C] italic flex items-start gap-1">
                          <Info size={11} className="mt-0.5 shrink-0" />
                          {step.tip}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {recipe.type === 'batch_week' && (
              <Card>
                <h2 className="font-semibold text-[#1C1917] mb-3 flex items-center gap-2">
                  <Package size={18} className="text-[#F97316]" /> Batch Plan
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Total meals', value: String(recipe.batch.numberOfMeals) },
                    { label: 'Containers needed', value: String(recipe.batch.numberOfContainers) },
                    { label: 'Keep in fridge', value: `${recipe.batch.fridgeMeals} meals` },
                    { label: 'Freeze', value: `${recipe.batch.freezerMeals} meals` },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#FDF6E9] rounded-xl p-3">
                      <p className="font-semibold text-[#1C1917]">{stat.value}</p>
                      <p className="text-xs text-[#78716C]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <h2 className="font-semibold text-[#1C1917] mb-3 flex items-center gap-2">
                <Thermometer size={18} className="text-[#F97316]" /> Storage & Serving
              </h2>
              <div className="space-y-2 text-sm text-[#78716C]">
                <div className="flex justify-between">
                  <span>Fridge:</span>
                  <span className="font-medium text-[#1C1917]">{recipe.storage.fridgeDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Freezer:</span>
                  <span className="font-medium text-[#1C1917]">{recipe.storage.freezerMonths} months</span>
                </div>
                <p className="pt-2 border-t border-[#E7E5E4] text-xs leading-relaxed">{recipe.storage.thawInstructions}</p>
                <p className="text-xs leading-relaxed">{recipe.storage.servingTemperature}</p>
                <p className="text-xs leading-relaxed">{recipe.storage.portioningNotes}</p>
              </div>
            </Card>

            {recipe.transitionGuide && (
              <Card>
                <h2 className="font-semibold text-[#1C1917] mb-3">7-Day Transition Guide</h2>
                <ol className="space-y-2">
                  {recipe.transitionGuide.map((step, index) => (
                    <li key={index} className="text-sm text-[#78716C] flex items-start gap-2">
                      <span className="text-[#F97316] font-semibold shrink-0">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {recipe.safetyNotes.length > 0 && (
              <Disclaimer variant="safety" title="Safety Notes">
                <ul className="space-y-1">
                  {recipe.safetyNotes.map((note, index) => <li key={index} className="text-xs">• {note}</li>)}
                </ul>
              </Disclaimer>
            )}

            <Disclaimer variant="warning" title="Veterinary Disclaimer">
              <p className="text-xs">{recipe.vetDisclaimer}</p>
            </Disclaimer>
          </div>
        )}

        {activeTab === 'shopping' && (
          <Card>
            <h2 className="font-semibold text-[#1C1917] mb-4">Shopping List</h2>
            <ShoppingList items={recipe.shoppingList} recipeName={recipe.name} />
          </Card>
        )}

        {activeTab === 'supplements' && recipe.supplements.length > 0 && (
          <SupplementChecklist supplements={recipe.supplements} />
        )}
      </PageWrapper>
    </>
  );
}
