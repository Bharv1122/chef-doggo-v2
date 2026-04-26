import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Recipe } from '../../types/recipe';
import { getNutritionMacroBreakdown } from '../../utils/recipeInsights';

interface Props {
  recipe: Recipe;
}

const MACRO_COLORS = {
  protein: '#22C55E',
  fat: '#F59E0B',
  carb: '#60A5FA',
};

export function NutritionBreakdownChart({ recipe }: Props) {
  const macros = getNutritionMacroBreakdown(recipe);

  return (
    <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
      <div className="h-52 w-full max-w-[260px] mx-auto flex items-center justify-center">
        <PieChart width={220} height={220}>
          <Pie
            data={macros}
            dataKey="percentage"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={82}
            paddingAngle={2}
            stroke="#FFFBF5"
            strokeWidth={3}
          >
            {macros.map(entry => (
              <Cell key={entry.key} fill={MACRO_COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value ?? 0)}%`, name]}
            contentStyle={{ borderRadius: '12px', borderColor: '#E7E5E4', fontSize: '12px' }}
          />
        </PieChart>
      </div>

      <div className="space-y-2.5">
        {macros.map(item => (
          <div key={item.key} className="rounded-xl border border-[#E7E5E4] bg-[#FFFBF5] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#1C1917] flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: MACRO_COLORS[item.key] }}
                  aria-hidden="true"
                />
                {item.label}
              </p>
              <p className="text-sm font-bold text-[#1C1917]">{item.percentage}%</p>
            </div>
            <p className="text-xs text-[#78716C] mt-1">~{Math.round(item.calories)} kcal from ingredients</p>
          </div>
        ))}
        <p className="text-xs text-[#A8A29E] italic">
          Estimated from ingredient calorie contributions. Percentages are for planning only.
        </p>
      </div>
    </div>
  );
}
