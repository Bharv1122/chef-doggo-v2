import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, Sparkles, ChefHat, IceCream, Gift, Star } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { TREAT_TEMPLATES } from '../../data/recipeTemplates';
import { useRecipes } from '../../hooks/useRecipes';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { generateRecipe } from '../../utils/recipeGenerator';

const TREAT_CATEGORIES = [
  { id: 'all', label: 'All Treats', icon: <Sparkles size={16} /> },
  { id: 'frozen', label: 'Frozen', icon: <IceCream size={16} /> },
  { id: 'baked', label: 'Baked', icon: <Cake size={16} /> },
  { id: 'occasion', label: 'Special Occasion', icon: <Gift size={16} /> },
  { id: 'lick mat', label: 'Lick Mat', icon: <Star size={16} /> },
];

const SAFETY_RULES = [
  'No chocolate', 'No xylitol', 'No grapes or raisins', 'No added sugar',
  'No artificial sweeteners', 'No onion or garlic', 'No nutmeg', 'Plain ingredients only',
];

export default function TreatsPage() {
  const navigate = useNavigate();
  const { saveRecipe } = useRecipes();
  const { activeProfile } = useDogProfiles();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = TREAT_TEMPLATES.filter(t => {
    if (categoryFilter === 'all') return true;
    return t.tags.some(tag => tag.toLowerCase().includes(categoryFilter));
  });

  async function handleGenerate(templateId: string) {
    if (!activeProfile) { navigate('/profiles/new'); return; }
    setLoading(templateId);
    try {
      const recipe = await generateRecipe({
        dog: activeProfile,
        recipeType: 'treat',
        forceTemplateId: templateId,
      });
      const saved = saveRecipe(recipe);
      navigate(`/recipes/${saved.id}`);
    } catch {
      alert('Could not generate treat recipe. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Header title="Desserts & Treats" backTo="/" />
      <PageWrapper>
        <div className="mb-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Cake size={24} className="text-[#F97316]" />
          </div>
          <div>
            <h2 className="font-bold text-[#1C1917]">Treats & Special Occasions</h2>
            <p className="text-sm text-[#78716C] mt-0.5">Safe, dog-approved treats for every occasion — from training bites to birthday bowls.</p>
          </div>
        </div>

        {/* Safety reminder */}
        <Disclaimer variant="safety" title="Treat Safety Rules" className="mb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
            {SAFETY_RULES.map(r => <p key={r} className="text-xs">✓ {r}</p>)}
          </div>
          <p className="text-xs mt-2">Treats should make up no more than 10% of your dog's daily caloric intake.</p>
        </Disclaimer>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-4 px-4">
          {TREAT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={['shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                categoryFilter === cat.id
                  ? 'bg-[#F97316] border-[#F97316] text-white'
                  : 'bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]',
              ].join(' ')}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Treat templates */}
        <div className="space-y-3">
          {filtered.map(template => (
            <Card key={template.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1C1917] text-sm">{template.name}</h3>
                  <p className="text-xs text-[#78716C] mt-1 leading-relaxed">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="orange" className="text-xs">{tag}</Badge>
                    ))}
                    {template.budgetFriendly && <Badge variant="green">Budget-friendly</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#78716C]">
                    <span>⏱ ~{template.cookTimeMinutes} min</span>
                    <span>🌟 {template.skillLevel === 'beginner' ? 'Beginner' : 'Some experience'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  fullWidth
                  size="sm"
                  icon={<ChefHat size={15} />}
                  onClick={() => handleGenerate(template.id)}
                  loading={loading === template.id}
                  disabled={!!loading}
                >
                  Make This Treat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </PageWrapper>
    </>
  );
}
