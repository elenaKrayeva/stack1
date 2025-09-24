import { useEffect, useState } from "react";

export const useDebouncedValue = <T,>(value: T, delayMs = 1000): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};
