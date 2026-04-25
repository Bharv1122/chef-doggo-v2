import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, Utensils, ChefHat } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatRecipeType } from '../../utils/formatting';
import type { Recipe } from '../../types/recipe';

const TYPE_COLORS: Record<string, 'orange' | 'green' | 'amber' | 'blue' | 'gray'> = {
  topper: 'blue',
  full_meal: 'green',
  batch_week: 'amber',
  pantry: 'gray',
  treat: 'orange',
};

interface Props {
  recipe: Recipe;
  dogName?: string;
  onToggleFavorite?: () => void;
}

export function RecipeCard({ recipe, dogName, onToggleFavorite }: Props) {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/recipes/${recipe.id}`)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={TYPE_COLORS[recipe.type]}>{formatRecipeType(recipe.type)}</Badge>
            {dogName && <span className="text-xs text-[#78716C]">for {dogName}</span>}
          </div>
          <h3 className="font-semibold text-[#1C1917] mt-1.5 text-sm leading-snug">{recipe.name}</h3>
          <p className="text-xs text-[#78716C] mt-1 line-clamp-2">{recipe.description}</p>
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
            className="shrink-0 p-1.5 rounded-lg hover:bg-[#FDF6E9] transition-colors"
          >
            <Heart size={18} className={recipe.isFavorite ? 'fill-[#F97316] text-[#F97316]' : 'text-[#A8A29E]'} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#78716C]">
        <span className="flex items-center gap-1">
          <Utensils size={13} />
          {recipe.serving.mealsPerDay}x/day · {recipe.serving.cupsPerMeal}c per meal
        </span>
        <span className="flex items-center gap-1">
          <ChefHat size={13} />
          ~{recipe.nutrition.caloriesPerDay} kcal/day (est.)
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={e => { e.stopPropagation(); navigate(`/cook/${recipe.id}`); }}
        >
          Cook Mode
        </Button>
        <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); navigate(`/recipes/${recipe.id}`); }}>
          View Recipe
        </Button>
      </div>
    </Card>
  );
}
