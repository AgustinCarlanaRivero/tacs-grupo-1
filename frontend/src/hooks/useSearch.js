import { useState, useMemo } from "react";

export function useSearch(items, getSearchFields) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      getSearchFields(item).some(field => (field || "").toLowerCase().includes(q))
    );
  }, [items, query, getSearchFields]);

  return { query, setQuery, filtered };
}
