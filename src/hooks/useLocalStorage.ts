import { useEffect, useState } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = storageGet<T>(key);
    return stored !== null ? stored : initialValue;
  });

  useEffect(() => {
    const stored = storageGet<T>(key);
    setValue(stored !== null ? stored : initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    storageSet(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
