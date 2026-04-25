import React, { useState } from 'react';
import { CheckSquare, Square, Share2, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ShoppingListItem } from '../../types/recipe';

interface Props {
  items: ShoppingListItem[];
  recipeName?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  protein: '🥩 Proteins',
  produce: '🥦 Produce',
  pantry: '🫙 Pantry',
  supplement: '💊 Supplements',
  equipment: '📦 Equipment',
};

const CATEGORY_ORDER = ['protein', 'produce', 'pantry', 'supplement', 'equipment'];

export function ShoppingList({ items, recipeName }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggle = (i: number) => setChecked(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const grouped = CATEGORY_ORDER.reduce<Record<string, Array<{ item: ShoppingListItem; index: number }>>>((acc, cat) => {
    const inCat = items.map((item, index) => ({ item, index })).filter(({ item }) => item.category === cat);
    if (inCat.length) acc[cat] = inCat;
    return acc;
  }, {});

  const copyList = async () => {
    const lines = [`🐾 Chef Doggo Shopping List${recipeName ? ` — ${recipeName}` : ''}`, ''];
    for (const cat of CATEGORY_ORDER) {
      if (!grouped[cat]) continue;
      lines.push(CATEGORY_LABELS[cat]);
      for (const { item } of grouped[cat]) lines.push(`  • ${item.displayAmount}`);
      lines.push('');
    }
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#78716C]">{items.length} items · {checked.size} checked</p>
        <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={copyList}>
          {copied ? 'Copied!' : 'Copy List'}
        </Button>
      </div>

      {CATEGORY_ORDER.map(cat => {
        if (!grouped[cat]) return null;
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2">{CATEGORY_LABELS[cat]}</h4>
            <div className="space-y-1.5">
              {grouped[cat].map(({ item, index }) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggle(index)}
                  className={['w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors', checked.has(index) ? 'bg-green-50 border-green-200' : 'bg-white border-[#E7E5E4] hover:bg-[#FDF6E9]'].join(' ')}
                >
                  {checked.has(index)
                    ? <CheckSquare size={16} className="text-green-600 shrink-0 mt-0.5" />
                    : <Square size={16} className="text-[#A8A29E] shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className={['text-sm font-medium', checked.has(index) ? 'line-through text-[#A8A29E]' : 'text-[#1C1917]'].join(' ')}>
                      {item.displayAmount}
                    </span>
                    {item.note && (
                      <p className="text-xs text-[#78716C] mt-0.5 line-clamp-1">{item.note}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
