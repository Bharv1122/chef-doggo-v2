import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Filter, Heart } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { Button } from '../../components/ui/Button';
import { useRecipes } from '../../hooks/useRecipes';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { formatRecipeType } from '../../utils/formatting';
import type { RecipeType } from '../../types/recipe';

const TYPE_FILTERS: Array<{ value: RecipeType | 'all' | 'favorites'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'favorites', label: '❤️ Favorites' },
  { value: 'full_meal', label: 'Full Meals' },
  { value: 'batch_week', label: 'Batch Cook' },
  { value: 'topper', label: 'Toppers' },
  { value: 'treat', label: 'Treats' },
  { value: 'pantry', label: 'Pantry' },
];

export default function RecipesPage() {
  const navigate = useNavigate();
  const { recipes, toggleFavorite } = useRecipes();
  const { profiles } = useDogProfiles();
  const [filter, setFilter] = useState<RecipeType | 'all' | 'favorites'>('all');

  const dogMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));

  const filtered = recipes.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return r.isFavorite;
    return r.type === filter;
  });

  return (
    <>
      <Header
        title="Saved Recipes"
        actions={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => navigate('/bowl-builder')}>
            New Recipe
          </Button>
        }
      />
      <PageWrapper>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-4 px-4">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={['shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                filter === f.value
                  ? 'bg-[#F97316] border-[#F97316] text-white'
                  : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              {filter === 'favorites' ? <Heart size={32} className="text-[#F97316]" /> : <BookOpen size={32} className="text-[#F97316]" />}
            </div>
            <div>
              <h2 className="font-semibold text-[#1C1917] text-lg">
                {filter === 'favorites' ? 'No favorites yet' : 'No recipes yet'}
              </h2>
              <p className="text-[#78716C] text-sm mt-1">
                {filter === 'favorites' ? 'Heart a recipe to save it here' : 'Create your first recipe to get started'}
              </p>
            </div>
            {filter === 'all' && (
              <Button icon={<Plus size={16} />} onClick={() => navigate('/wizard')}>Create First Recipe</Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                dogName={dogMap[recipe.dogProfileId]}
                onToggleFavorite={() => toggleFavorite(recipe.id)}
              />
            ))}
          </div>
        )}
      </PageWrapper>
    </>
  );
}
