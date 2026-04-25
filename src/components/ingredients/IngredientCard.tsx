import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { getIngredientById } from '../../data/ingredients';
import { Badge } from '../ui/Badge';
import type { RecipeIngredient } from '../../types/recipe';

interface Props {
  ingredient: RecipeIngredient;
  onSwap?: (toId: string) => void;
}

const CATEGORY_COLORS: Record<string, 'orange' | 'green' | 'blue' | 'amber' | 'gray'> = {
  protein: 'orange', carb: 'amber', vegetable: 'green', fat: 'blue', supplement: 'gray', treat: 'orange',
};

export function IngredientCard({ ingredient, onSwap }: Props) {
  const [open, setOpen] = useState(false);
  const data = getIngredientById(ingredient.ingredientId);

  return (
    <div className="rounded-xl border border-[#E7E5E4] bg-white overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#FDF6E9] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <Badge variant={CATEGORY_COLORS[ingredient.category]}>{ingredient.category}</Badge>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-[#1C1917]">{ingredient.name}</span>
          <span className="text-xs text-[#78716C] ml-2">{ingredient.groceryFriendlyAmount}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-[#A8A29E]">
          <span>{ingredient.amountGrams}g</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && data && (
        <div className="px-4 pb-4 pt-1 bg-[#FDF6E9] border-t border-[#E7E5E4] space-y-2">
          <p className="text-xs text-[#78716C]">{data.whyIncluded}</p>

          {data.prepNotes && (
            <p className="text-xs text-[#78716C]">
              <span className="font-medium text-[#1C1917]">Prep: </span>{data.prepNotes}
            </p>
          )}

          {data.safetyNotes && (
            <div className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{data.safetyNotes}</span>
            </div>
          )}

          {data.possibleSwaps.length > 0 && onSwap && (
            <div>
              <p className="text-xs font-medium text-[#1C1917] mb-1 flex items-center gap-1">
                <ArrowLeftRight size={12} /> Possible swaps:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.possibleSwaps.map(swapId => {
                  const swapData = getIngredientById(swapId);
                  return swapData ? (
                    <button
                      key={swapId}
                      type="button"
                      onClick={() => onSwap(swapId)}
                      className="text-xs px-2.5 py-1 rounded-full border border-[#E7E5E4] bg-white hover:border-[#F97316] hover:text-[#F97316] transition-colors"
                    >
                      {swapData.name}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
