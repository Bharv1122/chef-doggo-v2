# CHANGELOG

All notable changes to **Chef Doggo** are documented in this file.

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
