import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { useDogProfiles } from '../../hooks/useDogProfiles';

type DogRow = {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  weightLbs: number;
  lifeStage?: string;
  activityLevel?: string;
  idealWeightLbs?: number;
};

const DEFAULT_DOGS: DogRow[] = [
  { id: '1', name: 'Buddy', breed: 'Golden Retriever', ageYears: 4, weightLbs: 28, lifeStage: 'Adult', activityLevel: 'Moderate', idealWeightLbs: 28 },
  { id: '2', name: 'Luna', breed: 'Pembroke Welsh Corgi', ageYears: 2, weightLbs: 20, lifeStage: 'Adult', activityLevel: 'Very Active', idealWeightLbs: 20 },
];

function DogProfileBlock({ dog, progress, goal, recent }: { dog: DogRow; progress: number; goal: string; recent: string[] }) {
  return (
    <article className="doggo-card p-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
          <div className="flex items-start gap-4">
            <img src="/chef-doggo-logo.webp" alt={dog.name} className="h-32 w-32 rounded-3xl border border-[#eadfce] bg-[#fff4ea] object-contain p-2" />
            <div className="min-w-0">
              <h3 className="text-[1.8rem] font-semibold">{dog.name} <span className="text-lg">⭐</span></h3>
              <p className="text-[#7f7469]">{dog.breed} · {dog.ageYears} yrs</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#6f6459]">
                <div className="rounded-xl bg-[#fff8ef] px-2 py-1">Weight: {dog.weightLbs} lbs</div>
                <div className="rounded-xl bg-[#fff8ef] px-2 py-1">Ideal: {dog.idealWeightLbs ?? dog.weightLbs} lbs</div>
                <div className="rounded-xl bg-[#fff8ef] px-2 py-1">Life Stage: {dog.lifeStage ?? 'Adult'}</div>
                <div className="rounded-xl bg-[#fff8ef] px-2 py-1">Activity: {dog.activityLevel ?? 'Moderate'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e4efd8] bg-[#f4fbef] p-3 text-sm">
              <p className="font-semibold">Food Preferences</p>
              <p className="mt-1 text-[#6e8767]">Loves: Sweet potato, carrots, blueberries</p>
            </div>
            <div className="rounded-2xl border border-[#ffe2ca] bg-[#fff7ef] p-3 text-sm">
              <p className="font-semibold">Favorite Proteins</p>
              <p className="mt-1 text-[#7a6d61]">Chicken, Turkey, Salmon</p>
            </div>
            <div className="rounded-2xl border border-[#ffd9d9] bg-[#fff2f2] p-3 text-sm">
              <p className="font-semibold">Foods to Avoid</p>
              <p className="mt-1 text-[#9a6767]">Onions, grapes, macadamia nuts</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
            <h4 className="font-semibold">Nutrition Goal</h4>
            <p className="mt-1 text-[#6f6459]">{goal}</p>
            <div className="mt-3 h-3 rounded-full bg-[#f4ebdf]">
              <div className="h-3 rounded-full bg-[#43a365]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#8d8278]">
              <span>On track!</span>
              <span>{progress}%</span>
            </div>
            <Button size="sm" variant="secondary" className="mt-3 w-full">View Progress</Button>
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Edit Profile', 'Create Recipe', 'Portion Calculator', 'Allergies'].map(item => (
                <button key={item} className="rounded-xl border border-[#eadfce] px-2 py-2 text-sm text-[#6f6459] hover:bg-[#fff8ef]">{item}</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
            <h4 className="font-semibold">Recent Recipes</h4>
            <div className="mt-2 space-y-2 text-sm text-[#6f6459]">
              {recent.map(item => <p key={item}>• {item}</p>)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DogProfilesPage() {
  const navigate = useNavigate();
  const { profiles } = useDogProfiles();

  const dogs: DogRow[] = profiles.length
    ? profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        breed: profile.breed,
        ageYears: profile.ageYears,
        weightLbs: profile.weightLbs,
        lifeStage: profile.lifeStage,
        activityLevel: profile.activityLevel,
        idealWeightLbs: profile.idealWeightLbs,
      }))
    : DEFAULT_DOGS;

  return (
    <AppShell active="dogs">
      <section className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="doggo-section-title">My Dogs ❤️</h1>
          <p className="mt-1 text-[1.1rem] text-[#7e7369]">Manage your dog profiles, nutrition goals, and favorite recipes all in one place.</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => navigate('/profiles/new')}>Add Another Dog</Button>
      </section>

      <div className="space-y-4">
        {dogs.slice(0, 2).map((dog, idx) => (
          <DogProfileBlock
            key={dog.id}
            dog={dog}
            progress={idx === 0 ? 75 : 60}
            goal={idx === 0 ? 'Maintain Healthy Weight' : 'Build & Maintain Muscle'}
            recent={idx === 0 ? ['Turkey & Sweet Potato Bowl', 'Chicken & Rice Comfort'] : ['Beef & Veggie Medley', 'Chicken & Quinoa Bowl']}
          />
        ))}
      </div>

      <section className="mt-4 doggo-soft-card grid items-center gap-3 p-4 sm:grid-cols-[220px_1fr_340px]">
        <img src="/chef-doggo-logo.webp" alt="Chef Doggo mascot" className="mx-auto h-40 w-40 object-contain" />
        <div>
          <h3 className="text-[1.4rem] font-semibold">Chef Doggo is here for you!</h3>
          <p className="mt-1 text-sm text-[#7f7469]">Every dog is unique, and I'm here to help you create meals that are safe, balanced, and made with love.</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => navigate('/assistant')}>Ask Chef Doggo</Button>
        </div>
        <div className="rounded-2xl border border-[#d6ebda] bg-[#f2fbf4] p-4 text-sm text-[#4d8b62]">
          <p className="font-semibold">Safety first, always ✅</p>
          <p className="mt-1 text-xs text-[#5f8b6a]">All recipes use safe, vet-recommended ingredients and are checked against a toxic food database.</p>
        </div>
      </section>
    </AppShell>
  );
}
