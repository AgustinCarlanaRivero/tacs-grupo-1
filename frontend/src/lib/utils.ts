import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { MockCollectionItem } from "@/data/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function filterStickers(
  collection: MockCollectionItem[],
  query: string
): MockCollectionItem[] {
  if (!query) return collection;
  const q = query.toLowerCase();
  return collection.filter(
    (item) =>
      item.sticker.player.name.toLowerCase().includes(q) ||
      (item.sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
      (item.sticker.player.club?.name || "").toLowerCase().includes(q)
  );
}
