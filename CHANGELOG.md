# CHANGELOG

All notable changes to **Chef Doggo** are documented in this file.

## [v1.1.0] - 2026-05-10

### Release summary
A feature-heavy minor release on top of v1.0.0. Major additions: Supabase-backed auth and cloud sync, AI-generated recipe imagery, a rebuilt design system, vet sign-off + PDF export, persistent unit preference, allergen-aware nutrition insights and shopping export. Closes out with a code-quality pass that clears the lint and typecheck backlogs and hardens the recipe/profile hooks against unnecessary re-renders.

### Major features

- **Supabase auth + user-scoped cloud persistence (`src/contexts/AuthContext.tsx`, `src/lib/auth.ts`, `src/lib/supabase.ts`, `src/components/auth/ProtectedRoute.tsx`, `src/pages/Auth/*`, `docs/supabase-setup.md`)**
  - **What was added:** Email/password login, signup, and password reset flows; protected app routes; user-scoped cloud persistence for `dog_profiles`, `saved_recipes`, and `user_preferences`; logout from the app shell.
  - **Why it mattered:** Recipes and profiles previously lived only in localStorage, making them fragile and device-bound.
  - **Technical details:** Adds `@supabase/supabase-js`; `useDogProfiles` and `useRecipes` now branch on `isSupabaseConfigured` and a current `userId`, falling back to localStorage when env vars are missing. Auth is wired in `main.tsx` via `AuthProvider`; protected pages are gated by `ProtectedRoute`. A follow-up checkpoint hardened auth error handling in `src/lib/auth.ts`.

- **AI recipe image generation with on-device caching (`src/utils/recipeImageGenerator.ts`, `src/utils/recipeInsights.ts`, `src/types/recipe.ts`, `src/vite-env.d.ts`)**
  - **What was added:** Recipes now get generated images that flow through the Recipe card, detail, cooking mode, and listing views.
  - **Why it mattered:** Plain-text recipe cards lacked appeal and were harder to scan visually.
  - **Technical details:** New `recipeImageGenerator.ts` utility; `Recipe` type extended with `imageUrl`; recipe card / detail / index / cooking pages now resolve a generated photo via `getRecipePhoto`. Vite env types extended for the API key.

- **Recipe insights: nutrition breakdown chart, allergen warnings, shopping list export (`src/components/recipe/NutritionBreakdownChart.tsx`, `src/components/shopping/ShoppingList.tsx`, `src/components/recipe/RecipeCard.tsx`, `src/pages/Recipes/RecipeDetail.tsx`, `src/utils/recipeInsights.ts`)**
  - **What was added:** A macro-pie nutrition chart on each recipe; allergen-aware warnings tied to dog profiles; a richer shopping-list view with export.
  - **Why it mattered:** Owners need at-a-glance macro context, allergen safety signals, and an actionable shopping artifact.
  - **Technical details:** Adds `recharts` for the pie chart; new `getNutritionMacroBreakdown`, `getNutritionBreakdown`, and `getSubstitutions` helpers in `recipeInsights.ts`; shopping list gains an export path.

- **Vet approval / sign-off + downloadable blank PDF (`src/pages/VetExport/index.tsx`, `public/vet-approval-template.pdf`)**
  - **What was added:** A vet sign-off section in the export view and a downloadable blank PDF template.
  - **Why it mattered:** Veterinarian buy-in is required for safe long-term homemade feeding; the printable artifact streamlines that conversation.

- **Mockup-driven design system + page redesign (`src/styles/designSystem.ts`, `src/components/layout/AppShell.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/index.css`, `src/pages/Home/index.tsx`, `src/pages/Recipes/*`, `src/pages/DogProfiles/index.tsx`, `src/pages/Treats/index.tsx`, `src/pages/Assistant/index.tsx`)**
  - **What changed:** Introduces a shared `AppShell`, formalizes the design tokens in `designSystem.ts`, and rewrites Home, Recipes, RecipeDetail, DogProfiles, Treats, and Assistant against the new mockups.
  - **Why it mattered:** Pages had drifted from the intended visual language during early iteration.
  - **Technical details:** `AppShell` centralizes top-bar/bottom-nav scaffolding so individual pages don't re-implement layout chrome; `Button` and `Card` get token-aligned variants.

- **Persistent unit preference + dual-format ingredient displays (`src/contexts/UnitPreferenceContext.tsx`, `src/utils/calculator.ts`, `src/types/recipe.ts`, `src/components/shopping/ShoppingList.tsx`, `src/components/ingredients/IngredientCard.tsx`)**
  - **What was added:** A user-level unit preference (`us_volume` | `metric`) backed by Supabase + localStorage; ingredient amounts now render in both formats.
  - **Why it mattered:** Owners cooking from these recipes vary between cups/oz and metric; forcing one was a constant friction.
  - **Technical details:** Adds `formatIngredientByPreference`; recipe ingredient shape gains `displayMetric` / `displayVolume`; preference is hydrated from storage and synced to `user_preferences` via `UnitPreferenceContext`.

### Safety improvements
- **Strict allergy/avoid-food filtering enforced during recipe generation (`src/utils/recipeGenerator.ts`, `src/utils/safetyValidator.ts`, `src/types/recipe.ts`, `src/components/recipe/RecipeCard.tsx`, `src/pages/Recipes/RecipeDetail.tsx`)**
  - **What was fixed:** Generation now hard-rejects recipes containing the dog's allergens or avoided foods; the result surface in the card and detail views.
  - **Why it mattered:** Soft warnings could still leave dangerous ingredients in the bowl.
  - **Technical details:** `Recipe.allergenSafety` records `checkedTerms`, `allergenFree`, `warning`, and `matchedIngredients`; `safetyValidator` now drives ingredient filtering rather than just post-hoc warnings.

### Bug fixes

- **Newly-introduced recipe/photo/chart/shopping bugs (`src/components/recipe/NutritionBreakdownChart.tsx`, `src/components/shopping/ShoppingList.tsx`, `src/pages/VetExport/index.tsx`, `src/utils/calculator.ts`, `src/utils/formatting.ts`, `src/utils/recipeGenerator.ts`, `src/utils/recipeInsights.ts`)**
  - 8 follow-up bugs from the recipe-visuals work were swept up in `a0f25f2`.

- **Mobile nav, real data states, recipe filters, calculations (`src/components/layout/AppShell.tsx`, `src/pages/Home/index.tsx`, `src/pages/Recipes/*`, `src/pages/DogProfiles/index.tsx`, `src/pages/Treats/index.tsx`, `src/utils/recipeGenerator.ts`)**
  - QA pass after the design-system migration: mobile nav corrected, recipe filtering tightened, several calculation paths fixed, and pages now render distinct empty/loading/loaded states correctly.

- **Ingredient customization flow + recipe variety (`src/pages/Recipes/RecipeDetail.tsx`, `src/utils/recipeGenerator.ts`)**
  - Customizing a recipe's ingredients now updates the saved recipe and shopping list correctly; recipe generation now produces more variety across runs (PR #1).

### Code quality

- **CookingMode voice TDZ bug + full lint/typecheck backlog cleared (`src/pages/CookingMode/index.tsx`, `src/hooks/useVoice.ts`, plus 14 other files)**
  - **What was fixed:** `handleCommand` referenced `voice` before its `const voice = useVoice(handleCommand)` declaration — a real TDZ-and-stale-closure bug affecting `REPEAT_STEP` and `STOP_LISTENING`. Resolved via a `voiceRef` updated in an effect.
  - **Lint:** Project went from 40 errors to 0; typecheck went from 9 module-resolution errors to 0 after `npm install`.
  - **Technical details:** All 14 `any` types replaced with proper unions; all 5 `catch (e: any)` rewritten as `catch (e)` with `e instanceof Error` narrowing; React Compiler `preserve-manual-memoization` warnings fixed by dropping redundant `useMemo`s; stale `setSupported` cascading-render effect in `useVoice` removed.

- **Stable callback identities in `useRecipes` and `useDogProfiles` (`src/hooks/useRecipes.ts`, `src/hooks/useDogProfiles.ts`)**
  - **What was fixed:** Every returned function (`saveRecipe`, `updateRecipe`, `deleteRecipe`, `toggleFavorite`, `getRecipe`, `getRecipesByDog`, `getFavorites`, `setActiveProfileId`, `createProfile`, `updateProfile`, `deleteProfile`, `getProfile`) was a brand-new closure on every render.
  - **Why it mattered:** Consumers using these in `useEffect` deps or in `React.memo`'d children would see "changes" every render, defeating memoization.
  - **Technical details:** Mutators wrapped in `useCallback` with `[userId]` deps; current state read via `recipesRef` / `profilesRef` / `activeProfileIdRef`. Getters wrapped with the relevant state in deps so consumers see fresh data when state churns.

- **README accuracy (`README.md`)**
  - Removed the "pre-existing ESLint issues" note now that lint passes cleanly.

### Source commits included in this checkpoint
- `4c59167` - feat: add recipe visuals, allergen warnings, nutrition charts, and shopping list export
- `a0f25f2` - Checkpoint: fix 8 newly introduced recipe/photo/chart/shopping bugs
- `f29e813` - feat(vet-export): add vet approval/sign-off section + downloadable blank PDF template
- `59dffc4` - Implement Chef Doggo mockup-driven design system and page redesign
- `013a11b` - Add Supabase auth, protected routes, and user-scoped cloud data
- `cb6a005` - chore(auth-checkpoint): finalize Supabase auth rollout
- `e5d1d5f` - Fix critical QA bugs: mobile nav, real data states, recipe filters & calculations
- `c3da139` - Add persistent unit preference and dual-format ingredient displays
- `79058e5` - fix(safety): enforce strict allergy/avoid-food filtering in recipe generation
- `dce1c6f` - Add AI recipe image generation with caching and UI integration
- `b02e010` - Fix ingredient customization flow and improve recipe variety (PR #1)
- `beb0999` - Fix CookingMode voice TDZ bug and clear lint+typecheck backlog
- `e0f182b` - Stabilize useRecipes/useDogProfiles callback identities
- `e1f9d12` - README: drop stale "pre-existing ESLint issues" note

## [v1.0.0] - 2026-04-25

### Release summary
This checkpoint marks the first stable release candidate for Chef Doggo v2 after a focused round of hardening across recipe safety logic, nutrition math, pantry input workflows, recipe UX, and runtime preview configuration.

### Centering bug fix
- **Layout centering regression fixed (`src/index.css`)**
  - **What was fixed:** Global reset rules that zeroed margins/padding for all elements were moved into `@layer base` and simplified to avoid conflicting with Tailwind layout utilities.
  - **Why it mattered:** The previous reset overrode utility-driven spacing/container behavior, causing page centering/layout drift in key views.
  - **Technical details:** Removed global `margin: 0; padding: 0;` reset from the universal selector and scoped base styling so Tailwind-generated styles keep expected precedence.

### Critical Safety fixes
- **(1/10) Pantry ingredient safety validation now blocks unsafe entries (`src/pages/PantryMode/index.tsx`)**
  - **What was fixed:** Ingredient submissions are validated entry-by-entry before being committed.
  - **Why it mattered:** Unsafe ingredients could previously slip through certain input patterns and reduce trust in safety gating.
  - **Technical details:** Added parsed-entry validation pass with first-unsafe short-circuit and surfaced safety error text directly in the form.

- **(2/10) Fish oil moved from `fat` to `supplement` (`src/data/ingredients.ts`)**
  - **What was fixed:** Ingredient taxonomy for `fish_oil` was corrected.
  - **Why it mattered:** Fish oil should be dosed as a supplement, not proportioned as a macro fat.
  - **Technical details:** Updated ingredient category to `supplement`, which changes downstream handling in recipe generation and display.

- **(3/10) Fish oil dosage made weight-aware and bounded (`src/utils/recipeGenerator.ts`)**
  - **What was fixed:** Fish oil quantities are now generated with conservative dosage bounds.
  - **Why it mattered:** Generic split-based gram allocation can over/under-dose supplements.
  - **Technical details:** Added `fishOilSupplementGrams(weightLbs)` with a bounded range (0.5g-3g) and custom grocery-friendly amount formatting.

### Functional fixes
- **(4/10) Treat generation now follows calorie-cap logic (`src/utils/recipeGenerator.ts`)**
  - **What was fixed:** Treat recipes no longer use a fixed 50g output; they scale from dog-specific DER.
  - **Why it mattered:** Fixed-size treats ignore dog size and can violate recommended calorie limits.
  - **Technical details:** Introduced `treatDailyCalorieCap = round(DER * 0.1)` and derived treat grams/serving values from that cap.

- **(5/10) Batch duration logic corrected for full meals (`src/utils/recipeGenerator.ts`)**
  - **What was fixed:** Full-meal recipes now honor selected batch duration.
  - **Why it mattered:** Duration previously defaulted incorrectly, leading to wrong total-yield computations.
  - **Technical details:** Updated `effectiveDuration` condition to apply `batchDuration` for `full_meal` and `batch_week`.

- **(6/10) Equipment shopping quantities now scale with batch containers (`src/utils/recipeGenerator.ts`)**
  - **What was fixed:** Storage container recommendation is no longer hardcoded to `7+`.
  - **Why it mattered:** Hardcoded values mismatch generated batch output.
  - **Technical details:** `buildShoppingList` now receives `batch` data and formats equipment amount as `${batch.numberOfContainers}+ meal-sized containers`.

### UX fixes
- **(7/10) Recipe cards show treat-specific stats instead of meal stats (`src/components/recipe/RecipeCard.tsx`)**
  - **What was fixed:** Treat cards now present cap-oriented labels and calorie context.
  - **Why it mattered:** Meal-centric copy was misleading for treat recipes.
  - **Technical details:** Conditional card stat rendering by recipe type (`treat` vs non-treat).

- **(8/10) Recipe detail quick stats now adapt by recipe type and scale (`src/pages/Recipes/RecipeDetail.tsx`)**
  - **What was fixed:** Quick-stat tiles and disclaimers were made context-aware and scale-aware.
  - **Why it mattered:** Users saw generic metrics that were less accurate for treats and scaled servings.
  - **Technical details:** Added computed `scaledServing`, `scaledNutrition`, `quickStats`, and treat-specific footer copy.

- **(9/10) Recipes empty states now distinguish “none created” vs “filtered out” (`src/pages/Recipes/index.tsx`)**
  - **What was fixed:** Empty-state messaging and CTA logic now reflect filter context.
  - **Why it mattered:** Users got confusing “no recipes yet” messages when recipes existed but were filtered.
  - **Technical details:** Introduced `hasAnyRecipes` and `isFilteredOut` to drive title/body/CTA rendering.

### Architectural fixes
- **(10/10) Removed duplicate bottom navigation render on Home (`src/pages/Home/index.tsx`)**
  - **What was fixed:** Redundant `BottomNav` import/render was removed from the page body.
  - **Why it mattered:** Duplicate navigation created visual clutter and inconsistent page structure.
  - **Technical details:** Eliminated extra component usage so app-level navigation renders once.

### Additional reliability hardening
- **Calculator numeric guardrails (`src/utils/calculator.ts`, `src/pages/Calculator/index.tsx`)**
  - Added finite/positive input checks in `calcRER` and `calsToGrams`.
  - Updated calculator UI handling for invalid/empty numeric input and explicit weight error messaging.
  - Prevents NaN propagation and ensures stable output for invalid states.

### Vite config improvements
- **Preview and dev server accessibility update (`vite.config.ts`)**
  - **What changed:** Added `server.host = '0.0.0.0'`, `server.port = 3000`, `server.strictPort = true`, and `server.allowedHosts = true`.
  - **Why it mattered:** Fixed 403 access issues on external preview domains and made runtime behavior deterministic across local/cloud sessions.
  - **Technical details:** The server now binds explicitly and accepts preview host headers while avoiding silent port fallbacks.

### Source commits included in this checkpoint
- `62d8825` - fix(layout): preserve Tailwind container utilities by removing global reset override
- `75f5d0d` - Fix pantry safety validation, fish oil dosing, batch sizing, and calculator guards
- `17adde6` - Fix treat-cap UI stats, scale headline updates, filter messaging, and duplicate bottom nav
- `2967f5f` - Fix Vite preview access by allowing external host on dev server
