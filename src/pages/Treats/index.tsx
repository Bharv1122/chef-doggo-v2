import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

const TABS = ['Training Treats', 'Frozen Bites', 'Birthday Bowls', 'Everyday Rewards'];

const TREATS = [
  { name: 'Blueberry Yogurt Bites', desc: 'Soft, tasty bites packed with antioxidants and probiotic goodness.', time: '20 min', level: 'Easy', tags: ['Dairy', 'Grain-Free'] },
  { name: 'Cheesy Pumpkin Bones', desc: 'Gentle on tummies and perfect for training sessions.', time: '30 min', level: 'Easy', tags: ['Dairy', 'Vegetarian'] },
  { name: 'Berry Bliss Paws', desc: 'Cool, refreshing frozen treats for warm days.', time: '10 min', level: 'Easy', tags: ['Fruit', 'Dairy-Free'] },
  { name: 'Peanut Butter Bites', desc: 'A classic favorite for everyday good behavior.', time: '15 min', level: 'Easy', tags: ['Nut-Free Option', 'Grain-Free'] },
  { name: 'Mini Birthday Stars', desc: 'Crispy little stars to celebrate your pup\'s big day!', time: '40 min', level: 'Moderate', tags: ['Grain-Free', 'Dog-Safe Color'] },
  { name: 'Cinnamon Apple Chips', desc: 'Crispy, naturally sweet, and loaded with fiber.', time: '2 hr', level: 'Easy', tags: ['Fruit', 'Grain-Free'] },
  { name: 'Minty Fresh Bones', desc: 'Breath-refreshing frozen bites with parsley & mint.', time: '15 min', level: 'Easy', tags: ['Herbal', 'Dairy-Free'] },
  { name: 'Oatmeal Blueberry Drops', desc: 'Soft-baked drops with oats and juicy blueberries.', time: '25 min', level: 'Easy', tags: ['Grain', 'Fruit'] },
];

export default function TreatsPage() {
  const navigate = useNavigate();

  return (
    <AppShell
      active="treats"
      rightRail={
        <>
          <section className="doggo-card p-5">
            <h3 className="text-[1.35rem] font-semibold">Featured Seasonal Treats 🐾</h3>
            <div className="mt-3 rounded-2xl border border-[#eadfce] bg-white p-3">
              <div className="grid h-28 place-items-center rounded-xl bg-[#fff0de] text-5xl">🥕</div>
              <p className="mt-2 rounded-full bg-[#eaf6ea] px-2 py-0.5 text-xs font-semibold text-[#43a365] inline-block">Spring Special</p>
              <h4 className="mt-2 text-lg font-semibold">Carrot & Pumpkin Spring Snacks</h4>
              <p className="mt-1 text-sm text-[#7b7065]">Bright, crunchy, and full of seasonal goodness.</p>
              <Button size="sm" className="mt-3 w-full">View Recipe</Button>
            </div>
          </section>

          <section className="doggo-card p-5">
            <h3 className="text-[1.35rem] font-semibold">Birthday Bowl Spotlight</h3>
            <div className="mt-3 rounded-2xl border border-[#eadfce] bg-white p-3">
              <div className="grid h-24 place-items-center rounded-xl bg-[#f6efff] text-4xl">🎂</div>
              <p className="mt-2 text-lg font-semibold">Pup's Party Bowl</p>
              <p className="text-sm text-[#7b7065]">A festive, dog-safe bowl made for celebrations.</p>
              <Button size="sm" className="mt-3 w-full">View Recipe</Button>
            </div>
          </section>

          <section className="rounded-3xl border border-[#d6ebda] bg-[#f2fbf4] p-5 text-sm text-[#4f8f64]">
            <h4 className="font-semibold">Safety & Moderation</h4>
            <ul className="mt-2 space-y-1 text-xs text-[#60896d]">
              <li>✓ Use dog-safe ingredients only.</li>
              <li>✓ Avoid toxic foods like chocolate, onions, grapes, xylitol.</li>
              <li>✓ Treats should be 10% or less of daily calories.</li>
              <li>✓ Introduce new ingredients slowly.</li>
            </ul>
          </section>
        </>
      }
    >
      <section className="doggo-soft-card overflow-hidden p-7">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="doggo-section-title">Treats & Special Bowls 💗</h1>
            <p className="mt-2 text-[1.2rem] text-[#7f7469]">Wholesome, homemade treats and celebration bowls made with real ingredients—and lots of love.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#6f6459]">
              <span>🛡️ Real ingredients</span>
              <span>🧡 Made with love</span>
              <span>✅ Vet-informed</span>
            </div>
          </div>
          <img src="/chef-doggo-logo.webp" alt="Chef Doggo mascot" className="mx-auto h-56 w-56 object-contain" />
        </div>
      </section>

      <section className="mt-4 doggo-card p-5">
        <div className="flex flex-wrap gap-2 border-b border-[#eadfce] pb-4">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold',
                index === 0 ? 'bg-[#fff0de] text-[#f97316]' : 'text-[#7d7268] hover:bg-[#fff8ef]',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto">
            <button className="rounded-xl border border-[#eadfce] bg-white px-4 py-2 text-sm text-[#7a6f64]">Sort by Newest</button>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#8f857a]">Showing 12 recipes</p>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {TREATS.map(treat => (
            <article key={treat.name} className="rounded-2xl border border-[#eadfce] bg-white p-3">
              <div className="grid h-36 place-items-center rounded-xl bg-[#fff4ea] text-4xl">🍪</div>
              <p className="mt-2 text-lg font-semibold leading-tight">{treat.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[#7f7469]">{treat.desc}</p>
              <p className="mt-2 text-xs text-[#8f857a]">⏱ {treat.time} &nbsp; • &nbsp; 🌟 {treat.level}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {treat.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-[#f6efe4] px-2 py-0.5 text-xs font-semibold text-[#8f7d69]">{tag}</span>
                ))}
              </div>
              <Button size="sm" className="mt-3 w-full" onClick={() => navigate('/wizard')}>View Recipe</Button>
            </article>
          ))}
        </div>

        <button className="mt-5 w-full rounded-2xl border border-dashed border-[#f2c8a0] py-3 text-sm font-semibold text-[#f97316]">+ Load more tasty treats</button>
      </section>
    </AppShell>
  );
}
