import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Heart, Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { useRecipes } from '../../hooks/useRecipes';

const FILTERS = ['Life Stage', 'Protein', 'Prep Time', 'Budget', 'Picky Eater', 'Batch Cook'];

const FEATURED = [
  { name: 'Turkey & Sweet Potato Bowl', badge: 'Popular', cal: '420 kcal/cup', time: '35 min' },
  { name: 'Chicken & Rice Comfort', badge: 'High Rated', cal: '380 kcal/cup', time: '30 min' },
  { name: 'Beef & Veggie Medley', badge: 'Batch Friendly', cal: '450 kcal/cup', time: '40 min' },
];

const MOCK_RECIPES = [
  { id: 'r1', name: 'Salmon & Quinoa Power Bowl', desc: 'Omega-rich salmon with quinoa, spinach, and pumpkin.', cal: 410, time: 30, isFavorite: false },
  { id: 'r2', name: 'Lamb & Veggie Stew', desc: 'Tender lamb with butternut squash, carrots, and green beans.', cal: 460, time: 45, isFavorite: false },
  { id: 'r3', name: 'Chicken & Pumpkin Bowl', desc: 'Chicken, pumpkin, and oats for a cozy, fiber-rich meal.', cal: 360, time: 30, isFavorite: false },
  { id: 'r4', name: 'White Fish & Potato Bowl', desc: 'Mild white fish with potatoes, peas, and carrots.', cal: 390, time: 35, isFavorite: false },
  { id: 'r5', name: 'Venison & Berry Bowl', desc: 'Lean venison with blueberries and sweet potato.', cal: 430, time: 42, isFavorite: false },
  { id: 'r6', name: 'Egg & Veggie Scramble', desc: 'Eggs with spinach, carrots, and brown rice.', cal: 340, time: 25, isFavorite: false },
];

export default function RecipesPage() {
  const navigate = useNavigate();
  const { recipes, toggleFavorite } = useRecipes();

  const cards = recipes.length
    ? recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        desc: recipe.description,
        cal: recipe.nutrition.caloriesPerServing,
        time: recipe.instructions.reduce((sum, step) => sum + (step.durationMinutes ?? 5), 0),
        isFavorite: recipe.isFavorite,
      }))
    : MOCK_RECIPES;

  return (
    <AppShell
      active="recipes"
      rightRail={
        <>
          <section className="doggo-card p-5">
            <h3 className="text-[1.5rem] font-semibold">Why Homemade? 💗</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#7d7268]">
              <li><strong className="text-[#2b2118]">Better Ingredients</strong><br />You control what goes in.</li>
              <li><strong className="text-[#2b2118]">Tailored Nutrition</strong><br />Meals fit your dog's needs.</li>
              <li><strong className="text-[#2b2118]">Stronger Bond</strong><br />Made with love, just for them.</li>
            </ul>
          </section>

          <section className="doggo-card p-5">
            <h4 className="text-[1.25rem] font-semibold">Popular This Week</h4>
            <div className="mt-3 space-y-3 text-sm">
              {['Turkey & Sweet Potato Bowl', 'Chicken & Rice Comfort', 'Beef & Veggie Medley'].map((name, idx) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border border-[#eadfce] bg-white p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fff3e4] text-xs font-bold text-[#f97316]">{idx + 1}</span>
                  <p className="font-medium leading-tight">{name}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      }
    >
      <section className="doggo-soft-card overflow-hidden p-7">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h1 className="doggo-section-title">Find the Perfect Recipe 💗</h1>
            <p className="mt-2 text-[1.2rem] text-[#7f7469]">Wholesome, homemade meals your dog will love.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#675d54]">
              <span>🛡️ Vet-informed every time</span>
              <span>✨ Balanced nutrition in every bite</span>
              <span>🧡 Made with love and real ingredients</span>
            </div>
          </div>
          <img src="/chef-doggo-logo.webp" alt="Chef Doggo mascot" className="mx-auto h-60 w-60 object-contain" />
        </div>
      </section>

      <section className="mt-4 doggo-card p-5">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfce] pb-4">
          {['All Recipes', 'Full Meals', 'Toppers', 'Treats', 'Pantry Mode', 'Favorites'].map(tab => (
            <button
              key={tab}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold',
                tab === 'All Recipes' ? 'bg-[#fff0de] text-[#f97316]' : 'text-[#756b60] hover:bg-[#fff7ee]',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#fff9f0] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#7b7065]">
            <Filter size={15} /> Filters
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {FILTERS.map(filter => (
              <button key={filter} className="rounded-xl border border-[#eadfce] bg-white px-3 py-2 text-left text-sm text-[#6f6459]">{filter}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#eadfce] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.4rem] font-semibold">Featured Recipes</h2>
            <button className="text-sm font-semibold text-[#f97316]">View all featured →</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {FEATURED.map(item => (
              <div key={item.name} className="rounded-2xl border border-[#eadfce] bg-[#fffdf9] p-3">
                <div className="grid h-40 place-items-center rounded-xl bg-[#fff0de] text-4xl">🥘</div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-semibold leading-tight">{item.name}</p>
                  <span className="rounded-full bg-[#fff3e4] px-2 py-0.5 text-xs font-semibold text-[#f97316]">{item.badge}</span>
                </div>
                <p className="mt-2 text-xs text-[#8b8378]">{item.cal} • {item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 doggo-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[1.4rem] font-semibold">All Recipes ({cards.length})</h2>
          <Button size="sm" icon={<Plus size={15} />} onClick={() => navigate('/wizard')}>Start New Recipe</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(recipe => (
            <article key={recipe.id} className="rounded-2xl border border-[#eadfce] bg-white p-3">
              <div className="grid h-40 place-items-center rounded-xl bg-[#fff4ea] text-4xl">🍲</div>
              <h3 className="mt-3 text-lg font-semibold leading-tight">{recipe.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#8b8378]">{recipe.desc}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-[#7d7268]">
                <span>{recipe.cal} kcal/cup</span>
                <span>{recipe.time} min</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => navigate(`/recipes/${recipe.id}`)}>View Recipe</Button>
                <button
                  className={[
                    'grid h-10 w-10 place-items-center rounded-xl border border-[#eadfce] transition-colors',
                    recipe.isFavorite ? 'text-[#f97316] bg-[#fff4ea]' : 'text-[#c5b8a8] hover:text-[#f97316]',
                  ].join(' ')}
                  onClick={() => void toggleFavorite(recipe.id)}
                  aria-label="Toggle recipe favorite"
                >
                  <Heart size={16} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
