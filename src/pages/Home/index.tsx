import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat, CalendarDays, Droplets, ShoppingBag, Cake,
  Calculator, MessageCircle, Mic, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useDogProfiles } from '../../hooks/useDogProfiles';
import { useRecipes } from '../../hooks/useRecipes';
import { BottomNav } from '../../components/layout/BottomNav';

const FEATURES = [
  { icon: <ChefHat size={22} />, label: 'Full Meals', desc: 'Complete homemade recipes with portion math', to: '/bowl-builder' },
  { icon: <CalendarDays size={22} />, label: 'Batch Cook', desc: 'One cook, feed all week — with freezer plan', to: '/bowl-builder', highlight: true },
  { icon: <Droplets size={22} />, label: 'Toppers', desc: "Fresh add-ons for your dog's regular food", to: '/bowl-builder' },
  { icon: <ShoppingBag size={22} />, label: 'Pantry Mode', desc: 'Use what you already have', to: '/pantry' },
  { icon: <Cake size={22} />, label: 'Treats', desc: 'Birthday bowls, frozen bites, training treats', to: '/treats' },
  { icon: <Calculator size={22} />, label: 'Calculator', desc: 'Estimate portions for any dog', to: '/calculator' },
  { icon: <MessageCircle size={22} />, label: 'Ask Chef Doggo', desc: 'AI assistant for any question', to: '/assistant' },
  { icon: <Mic size={22} />, label: 'Voice Cooking', desc: 'Hands-free step-by-step cooking mode', to: '/recipes' },
];

const WHY_ITEMS = [
  { icon: <ShieldCheck size={20} className="text-[#22C55E]" />, label: 'Safety first', desc: 'Every recipe is checked against a toxic ingredient database.' },
  { icon: <Calculator size={20} className="text-[#F97316]" />, label: 'Portion math done for you', desc: 'Calories, gram weights, batch sizes — all calculated automatically.' },
  { icon: <Sparkles size={20} className="text-[#F59E0B]" />, label: 'Made for real life', desc: 'Budget mode, pantry mode, voice cooking, and weekly batch plans.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { activeProfile, profiles } = useDogProfiles();
  const { recipes } = useRecipes();

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/chef-doggo-logo.webp"
            alt="Chef Doggo"
            style={{ height: '128px' }}
            className="w-auto object-contain mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C1917] leading-tight">Chef Doggo</h1>
          <p className="text-lg md:text-xl text-[#78716C] mt-2 leading-snug">Homemade Dog Food Made Simple.</p>
          <p className="text-base text-[#A8A29E] mt-3 leading-relaxed max-w-md">
            Fresh recipes, smart portions, safety checks, and a helpful AI assistant — all in one app.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <button
              onClick={() => navigate('/wizard')}
              className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold rounded-full py-3 px-6 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
            >
              <ChefHat size={18} />
              {profiles.length === 0 ? 'Start Your First Bowl' : 'Build a New Recipe'}
            </button>
          </div>
          {recipes.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => navigate('/recipes')}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FDF6E9] text-[#1C1917] border border-[#E7E5E4] font-medium rounded-xl py-2.5 px-4 text-sm transition-colors"
              >
                My Recipes ({recipes.length})
              </button>
            </div>
          )}
        </div>

        {/* Cooking-for banner */}
        {activeProfile && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#F97316] font-semibold uppercase tracking-wide">Cooking for</p>
                  <h2 className="text-lg font-bold text-[#1C1917] mt-0.5">{activeProfile.name} 🐶</h2>
                  <p className="text-sm text-[#78716C]">{activeProfile.breed} · {activeProfile.weightLbs} lbs · {activeProfile.lifeStage}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/bowl-builder')} icon={<ArrowRight size={15} />}>
                  Cook Now
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* What can Chef Doggo do? */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1C1917] mb-4">What can Chef Doggo do?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <Card
                key={f.label}
                hoverable
                padding="none"
                onClick={() => navigate(f.to)}
                className={['p-5', f.highlight ? 'border-[#F59E0B] bg-amber-50' : ''].join(' ')}
              >
                <div className={['w-12 h-12 rounded-xl flex items-center justify-center p-2', f.highlight ? 'bg-[#F59E0B] text-white' : 'bg-orange-100 text-[#F97316]'].join(' ')}>
                  {f.icon}
                </div>
                <p className="font-semibold text-base text-[#1C1917] mt-3">{f.label}</p>
                <p className="text-sm text-[#78716C] mt-1 leading-snug">{f.desc}</p>
                {f.highlight && <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ Popular</span>}
              </Card>
            ))}
          </div>
        </div>

        {/* Why Chef Doggo? */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Why Chef Doggo?</h2>
          <div className="space-y-3">
            {WHY_ITEMS.map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-white rounded-2xl border border-[#E7E5E4] p-4">
                <span className="shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-semibold text-[#1C1917] text-sm">{item.label}</p>
                  <p className="text-xs text-[#78716C] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vet disclaimer */}
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
          <ShieldCheck size={24} className="text-[#22C55E] mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800">Always consult your veterinarian</p>
          <p className="text-xs text-green-700 mt-1 leading-relaxed">
            Chef Doggo provides general educational guidance. Before starting a homemade diet — especially for puppies, seniors, or dogs with health conditions — please consult a licensed veterinarian or veterinary nutritionist.
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
