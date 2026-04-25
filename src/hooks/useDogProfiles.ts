import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/storage';
import type { DogProfile } from '../types/dog';

export function useDogProfiles() {
  const [profiles, setProfiles] = useLocalStorage<DogProfile[]>('profiles', []);
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('active-profile', null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? profiles[0] ?? null;

  function createProfile(data: Omit<DogProfile, 'id' | 'createdAt' | 'updatedAt'>): DogProfile {
    const now = new Date().toISOString();
    const profile: DogProfile = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    setProfiles(prev => [...prev, profile]);
    if (!activeProfileId) setActiveProfileId(profile.id);
    return profile;
  }

  function updateProfile(id: string, data: Partial<DogProfile>): void {
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
    );
  }

  function deleteProfile(id: string): void {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      setActiveProfileId(remaining[0]?.id ?? null);
    }
  }

  function getProfile(id: string): DogProfile | undefined {
    return profiles.find(p => p.id === id);
  }

  return {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile,
  };
}
