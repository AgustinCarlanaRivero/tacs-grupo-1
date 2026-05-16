import { useState, useMemo } from "react";

export function useSearch<T>(
  items: T[],
  getSearchFields: (item: T) => Array<string | null | undefined>
) {
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      getSearchFields(item).some((field) => (field || "").toLowerCase().includes(q))
    );
  }, [items, query, getSearchFields]);

  return { query, setQuery, filtered };
}
