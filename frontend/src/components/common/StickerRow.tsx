import React from "react";
import type { MockSticker } from "@/data/types";

interface StickerRowProps {
  sticker: MockSticker;
  quantity: number;
}

export default function StickerRow({ sticker, quantity }: StickerRowProps) {
  const isShiny = sticker.type === "SHINY";
  return (
    <div className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded border border-slate-200 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-slate-500">#{sticker.number}</span>
        <span className="font-medium text-slate-700 truncate">{sticker.player.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
            isShiny
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          {isShiny ? "Shiny" : "Regular"}
        </span>
        <span className="font-black bg-[#002B5E] text-white px-2 py-0.5 rounded">x{quantity}</span>
      </div>
    </div>
  );
}
