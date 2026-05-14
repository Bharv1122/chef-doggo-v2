import { useEffect, useRef, useState } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Hold initialValue in a ref so callers can pass inline literals (`[]`, `{}`)
  // without churning the sync effect's deps on every render.
  const initialValueRef = useRef(initialValue);

  const [value, setValue] = useState<T>(() => {
    const stored = storageGet<T>(key);
    return stored !== null ? stored : initialValueRef.current;
  });

  useEffect(() => {
    const stored = storageGet<T>(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-sync when `key` changes (e.g., auth events scope storage per user).
    setValue(stored !== null ? stored : initialValueRef.current);
  }, [key]);

  useEffect(() => {
    storageSet(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
