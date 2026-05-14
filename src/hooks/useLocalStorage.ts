import { useEffect, useRef, useState } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Hold initialValue in a ref so the key-change effect below can use the
  // first-render default without listing initialValue in its deps (callers
  // commonly pass inline `[]`/`{}` literals that change identity every render).
  const initialValueRef = useRef(initialValue);

  const [value, setValue] = useState<T>(() => {
    const stored = storageGet<T>(key);
    return stored !== null ? stored : initialValue;
  });

  useEffect(() => {
    const stored = storageGet<T>(key);
    setValue(stored !== null ? stored : initialValueRef.current);
  }, [key]);

  useEffect(() => {
    storageSet(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
