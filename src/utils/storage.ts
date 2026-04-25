const PREFIX = 'chef-doggo';

export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded or unavailable — fail silently
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(`${PREFIX}:${key}`);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
