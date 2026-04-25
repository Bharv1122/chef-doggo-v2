import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/storage';
import type { Recipe } from '../types/recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('recipes', []);

  function saveRecipe(recipe: Recipe): Recipe {
    const exists = recipes.some(r => r.id === recipe.id);
    if (exists) {
      setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
      return recipe;
    }
    const saved = { ...recipe, id: recipe.id || generateId() };
    setRecipes(prev => [...prev, saved]);
    return saved;
  }

  function updateRecipe(id: string, data: Partial<Recipe>): void {
    setRecipes(prev =>
      prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)
    );
  }

  function deleteRecipe(id: string): void {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }

  function toggleFavorite(id: string): void {
    setRecipes(prev =>
      prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)
    );
  }

  function getRecipe(id: string): Recipe | undefined {
    return recipes.find(r => r.id === id);
  }

  function getRecipesByDog(dogProfileId: string): Recipe[] {
    return recipes.filter(r => r.dogProfileId === dogProfileId);
  }

  function getFavorites(): Recipe[] {
    return recipes.filter(r => r.isFavorite);
  }

  return {
    recipes,
    saveRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    getRecipe,
    getRecipesByDog,
    getFavorites,
  };
}
