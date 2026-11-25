import { useMemo, useSyncExternalStore } from "react";

const LISTENERS = new Set<() => void>();

const readStoredText = (key: string) => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const writeStoredText = (key: string, text: string) => {
  try {
    if (text) localStorage.setItem(key, text);
    else localStorage.removeItem(key);
  } catch {
    return false;
  }
  for (const listener of LISTENERS) listener();
  return true;
};

const subscribeToStoredValues = (listener: () => void) => {
  LISTENERS.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    LISTENERS.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

export const useLocalStorage = <Value>(key: string) => {
  const storedText = useSyncExternalStore(
    subscribeToStoredValues,
    () => readStoredText(key),
    () => "",
  );
  const value = useMemo(
    () => (storedText ? (JSON.parse(storedText) as Value) : null),
    [storedText],
  );

  return {
    value,
    update: (updater: (previous: Value | null) => Value | null) => {
      const previousText = readStoredText(key);
      const previous = previousText
        ? (JSON.parse(previousText) as Value)
        : null;
      const next = updater(previous);
      return writeStoredText(key, next === null ? "" : JSON.stringify(next));
    },
  };
};
