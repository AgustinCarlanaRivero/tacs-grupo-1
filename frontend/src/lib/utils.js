import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function filterStickers(collection, query) {
  if (!query) return collection;
  const q = query.toLowerCase();
  return collection.filter(item =>
    item.sticker.player.name.toLowerCase().includes(q) ||
    (item.sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
    (item.sticker.player.club?.name || "").toLowerCase().includes(q)
  );
}
