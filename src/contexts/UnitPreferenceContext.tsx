import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { storageGet, storageSet } from '../utils/storage';
import type { UnitPreference } from '../types/recipe';

interface UnitPreferenceContextValue {
  unitPreference: UnitPreference;
  setUnitPreference: (next: UnitPreference) => void;
  loading: boolean;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextValue | null>(null);

function dbUnitsToPreference(units: 'imperial' | 'metric' | null | undefined): UnitPreference {
  return units === 'metric' ? 'metric' : 'us_volume';
}

function preferenceToDbUnits(preference: UnitPreference): 'imperial' | 'metric' {
  return preference === 'metric' ? 'metric' : 'imperial';
}

export function UnitPreferenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const storageKey = useMemo(() => (userId ? `unit-preference:${userId}` : 'unit-preference:guest'), [userId]);

  const [unitPreference, setUnitPreferenceState] = useState<UnitPreference>('us_volume');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localValue = storageGet<UnitPreference>(storageKey);
    if (localValue === 'metric' || localValue === 'us_volume') {
      setUnitPreferenceState(localValue);
    } else {
      setUnitPreferenceState('us_volume');
    }
  }, [storageKey]);

  useEffect(() => {
    const client = supabase;
    const currentUserId = userId;

    if (!isSupabaseConfigured || !client || !currentUserId) {
      setLoading(false);
      return;
    }

    const supabaseClient = client;
    const authenticatedUserId = currentUserId;
    let isMounted = true;

    async function loadPreference() {
      setLoading(true);

      const { data, error } = await supabaseClient
        .from('user_preferences')
        .select('preferred_units')
        .eq('user_id', authenticatedUserId)
        .maybeSingle();

      if (!isMounted) return;

      if (!error && data?.preferred_units) {
        const next = dbUnitsToPreference(data.preferred_units);
        setUnitPreferenceState(next);
        storageSet(storageKey, next);
      }

      setLoading(false);
    }

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, [storageKey, userId]);

  const setUnitPreference = useCallback((next: UnitPreference) => {
    setUnitPreferenceState(next);
    storageSet(storageKey, next);

    const client = supabase;
    const currentUserId = userId;

    if (!isSupabaseConfigured || !client || !currentUserId) {
      return;
    }

    const nowIso = new Date().toISOString();
    void client.from('user_preferences').upsert(
      {
        user_id: currentUserId,
        preferred_units: preferenceToDbUnits(next),
        updated_at: nowIso,
        created_at: nowIso,
      },
      { onConflict: 'user_id' }
    );
  }, [storageKey, userId]);

  const value = useMemo<UnitPreferenceContextValue>(() => ({
    unitPreference,
    setUnitPreference,
    loading,
  }), [loading, setUnitPreference, unitPreference]);

  return <UnitPreferenceContext.Provider value={value}>{children}</UnitPreferenceContext.Provider>;
}

export function useUnitPreference() {
  const context = useContext(UnitPreferenceContext);
  if (!context) {
    throw new Error('useUnitPreference must be used within UnitPreferenceProvider.');
  }
  return context;
}
