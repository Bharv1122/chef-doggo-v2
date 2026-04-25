import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';

const Home          = lazy(() => import('./pages/Home'));
const Wizard        = lazy(() => import('./pages/Wizard'));
const DogProfiles   = lazy(() => import('./pages/DogProfiles'));
const NewProfile    = lazy(() => import('./pages/DogProfiles/NewProfile'));
const EditProfile   = lazy(() => import('./pages/DogProfiles/EditProfile'));
const Recipes       = lazy(() => import('./pages/Recipes'));
const RecipeDetail  = lazy(() => import('./pages/Recipes/RecipeDetail'));
const BowlBuilder   = lazy(() => import('./pages/BowlBuilder'));
const PantryMode    = lazy(() => import('./pages/PantryMode'));
const Treats        = lazy(() => import('./pages/Treats'));
const Calculator    = lazy(() => import('./pages/Calculator'));
const Assistant     = lazy(() => import('./pages/Assistant'));
const CookingMode   = lazy(() => import('./pages/CookingMode'));
const VetExport     = lazy(() => import('./pages/VetExport'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFFBF5]">
      <div className="w-16 h-16 rounded-full bg-[#F97316] flex items-center justify-center text-2xl animate-bounce">
        🐾
      </div>
      <p className="text-[#78716C] text-sm">Loading…</p>
    </div>
  );
}

// Full-screen pages that manage their own nav
const NO_BOTTOM_NAV_PREFIXES = ['/cook/', '/vet-export/'];

function AppLayout() {
  const location = useLocation();
  const showBottomNav = !NO_BOTTOM_NAV_PREFIXES.some(p => location.pathname.startsWith(p))
    && location.pathname !== '/';

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/wizard"              element={<Wizard />} />
          <Route path="/profiles"            element={<DogProfiles />} />
          <Route path="/profiles/new"        element={<NewProfile />} />
          <Route path="/profiles/:id/edit"   element={<EditProfile />} />
          <Route path="/recipes"             element={<Recipes />} />
          <Route path="/recipes/:id"         element={<RecipeDetail />} />
          <Route path="/bowl-builder"        element={<BowlBuilder />} />
          <Route path="/pantry"              element={<PantryMode />} />
          <Route path="/treats"             element={<Treats />} />
          <Route path="/calculator"          element={<Calculator />} />
          <Route path="/assistant"           element={<Assistant />} />
          <Route path="/cook/:id"            element={<CookingMode />} />
          <Route path="/vet-export/:id"      element={<VetExport />} />
        </Routes>
      </Suspense>
      {showBottomNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
