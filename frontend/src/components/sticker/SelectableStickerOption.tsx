"use client";

import React from "react";
import { Check } from "lucide-react";
import StickerFace from "@/components/sticker/StickerFace";
import type { MockCollectionItem, MockSticker } from "@/data/types";

interface SelectableStickerOptionProps {
  item: MockCollectionItem;
  selected: boolean;
  onToggle: (sticker: MockSticker) => void;
  requiredQuantity?: number;
}

export default function SelectableStickerOption({
  item,
  selected,
  onToggle,
  requiredQuantity,
}: SelectableStickerOptionProps) {
  const { sticker, quantity } = item;
  const hasEnough = requiredQuantity ? quantity >= requiredQuantity : true;

  return (
    <button
      onClick={() => hasEnough && onToggle(sticker)}
      disabled={!hasEnough}
      className={`relative w-full aspect-[4/5] transition-all duration-150 ${
        selected
          ? "ring-2 ring-[#002B5E] ring-offset-1 shadow-md"
          : hasEnough
            ? "ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-md"
            : "ring-1 ring-red-200 opacity-60 cursor-not-allowed"
      }`}
    >
      <StickerFace sticker={sticker} />

      {selected && (
        <div className="absolute inset-0 bg-[#002B5E]/20 flex items-center justify-center pointer-events-none z-30">
          <div className="w-8 h-8 rounded-full bg-[#002B5E] shadow-lg flex items-center justify-center">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {quantity > 1 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white bg-gray-900 shadow-md z-30">
          x{quantity}
        </div>
      )}

      {!hasEnough && requiredQuantity && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max px-2 py-0.5 rounded-full flex items-center justify-center font-bold text-[9px] text-white bg-red-500 shadow-md z-30">
          Faltan {requiredQuantity - quantity}
        </div>
      )}
    </button>
  );
}
