import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { generateId, storageGet, storageSet } from '../utils/storage';
import type { Recipe } from '../types/recipe';
import type { Json, SavedRecipeInsert, SavedRecipeRow } from '../types/database';

function toRecipe(row: SavedRecipeRow): Recipe {
  const recipe = row.recipe_data as unknown as Recipe;
  return {
    ...recipe,
    id: row.id,
    dogProfileId: row.dog_profile_id,
    name: row.name,
    description: row.description,
    type: row.type,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSavedRecipeRow(userId: string, recipe: Recipe): SavedRecipeInsert {
  return {
    id: recipe.id,
    user_id: userId,
    dog_profile_id: recipe.dogProfileId,
    name: recipe.name,
    description: recipe.description,
    type: recipe.type,
    recipe_data: recipe as unknown as Json,
    is_favorite: recipe.isFavorite,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt,
  };
}

export function useRecipes() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const recipesStorageKey = useMemo(() => (userId ? `recipes:${userId}` : 'recipes'), [userId]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    const currentUserId = userId;

    if (!isSupabaseConfigured || !client || !currentUserId) {
      const localRecipes = storageGet<Recipe[]>(recipesStorageKey) ?? [];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- userId changes on sign-in/out; we must hydrate recipes from local storage in the no-Supabase branch.
      setRecipes(localRecipes);
      setLoading(false);
      return;
    }

    const supabaseClient = client;
    const authenticatedUserId = currentUserId;
    let isMounted = true;

    async function loadRecipes() {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabaseClient
        .from('saved_recipes')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setRecipes((data ?? []).map(toRecipe));
      setLoading(false);
    }

    loadRecipes();

    return () => {
      isMounted = false;
    };
  }, [recipesStorageKey, userId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) {
      storageSet(recipesStorageKey, recipes);
    }
  }, [recipes, recipesStorageKey, userId]);

  async function saveRecipe(recipe: Recipe): Promise<Recipe> {
    const nowIso = new Date().toISOString();
    const normalized: Recipe = {
      ...recipe,
      id: recipe.id || generateId(),
      updatedAt: nowIso,
      createdAt: recipe.createdAt || nowIso,
    };

    const client = supabase;
    const currentUserId = userId;

    if (isSupabaseConfigured && client && currentUserId) {
      const payload = toSavedRecipeRow(currentUserId, normalized);
      const { error: saveError } = await client.from('saved_recipes').upsert(payload, {
        onConflict: 'id',
      });

      if (saveError) {
        throw new Error(saveError.message);
      }
    }

    setRecipes(prev => {
      const exists = prev.some(item => item.id === normalized.id);
      if (exists) {
        return prev.map(item => (item.id === normalized.id ? normalized : item));
      }
      return [normalized, ...prev];
    });

    return normalized;
  }

  async function updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
    const nextRecipe = recipes.find(recipe => recipe.id === id);
    if (!nextRecipe) return;

    const updated: Recipe = {
      ...nextRecipe,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const client = supabase;
    const currentUserId = userId;

    if (isSupabaseConfigured && client && currentUserId) {
      const payload = toSavedRecipeRow(currentUserId, updated);
      const { error: updateError } = await client
        .from('saved_recipes')
        .upsert(payload, { onConflict: 'id' });

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    setRecipes(prev => prev.map(recipe => (recipe.id === id ? updated : recipe)));
  }

  async function deleteRecipe(id: string): Promise<void> {
    const client = supabase;
    const currentUserId = userId;

    if (isSupabaseConfigured && client && currentUserId) {
      const { error: deleteError } = await client
        .from('saved_recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }

  async function toggleFavorite(id: string): Promise<void> {
    const recipe = recipes.find(item => item.id === id);
    if (!recipe) return;

    await updateRecipe(id, { isFavorite: !recipe.isFavorite });
  }

  function getRecipe(id: string): Recipe | undefined {
    return recipes.find(recipe => recipe.id === id);
  }

  function getRecipesByDog(dogProfileId: string): Recipe[] {
    return recipes.filter(recipe => recipe.dogProfileId === dogProfileId);
  }

  function getFavorites(): Recipe[] {
    return recipes.filter(recipe => recipe.isFavorite);
  }

  return {
    recipes,
    loading,
    error,
    saveRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    getRecipe,
    getRecipesByDog,
    getFavorites,
  };
}
