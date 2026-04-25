import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = storageGet<T>(key);
    return stored !== null ? stored : initialValue;
  });

  useEffect(() => {
    storageSet(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
