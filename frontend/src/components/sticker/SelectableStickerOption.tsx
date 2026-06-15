"use client";

import React from "react";
import { Check, Minus, Plus } from "lucide-react";
import StickerFace from "@/components/sticker/StickerFace";
import type { MockCollectionItem, MockSticker } from "@/data/types";

interface SelectableStickerOptionProps {
  item: MockCollectionItem;
  selected: boolean;
  onToggle: (sticker: MockSticker) => void;
  requiredQuantity?: number;
  /** Cantidad elegida a ofrecer (cuando está seleccionada). */
  selectedQuantity?: number;
  onQuantityChange?: (sticker: MockSticker, quantity: number) => void;
}

export default function SelectableStickerOption({
  item,
  selected,
  onToggle,
  requiredQuantity,
  selectedQuantity = 1,
  onQuantityChange,
}: SelectableStickerOptionProps) {
  const { sticker, quantity } = item;
  const hasEnough = requiredQuantity ? quantity >= requiredQuantity : true;
  const canPickQuantity = selected && !!onQuantityChange && quantity > 1;

  function changeQuantity(e: React.MouseEvent, next: number) {
    e.stopPropagation();
    if (next < 1 || next > quantity) return;
    onQuantityChange?.(sticker, next);
  }

  return (
    <div
      onClick={() => hasEnough && onToggle(sticker)}
      role="button"
      aria-pressed={selected}
      className={`relative w-full aspect-[4/5] transition-all duration-150 ${
        hasEnough ? "cursor-pointer" : "cursor-not-allowed"
      } ${
        selected
          ? "ring-2 ring-[#002B5E] ring-offset-1 shadow-md"
          : hasEnough
            ? "ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-md"
            : "ring-1 ring-red-200 opacity-60"
      }`}
    >
      <StickerFace sticker={sticker} />

      {selected && !canPickQuantity && (
        <div className="absolute inset-0 bg-[#002B5E]/20 flex items-center justify-center pointer-events-none z-30">
          <div className="w-8 h-8 rounded-full bg-[#002B5E] shadow-lg flex items-center justify-center">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {canPickQuantity && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 bg-[#002B5E]/85 py-1.5">
          <button
            type="button"
            onClick={(e) => changeQuantity(e, selectedQuantity - 1)}
            disabled={selectedQuantity <= 1}
            className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-40"
          >
            <Minus size={12} className="text-[#002B5E]" />
          </button>
          <span className="text-white font-bold text-sm min-w-[1.5rem] text-center">
            {selectedQuantity}
          </span>
          <button
            type="button"
            onClick={(e) => changeQuantity(e, selectedQuantity + 1)}
            disabled={selectedQuantity >= quantity}
            className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-40"
          >
            <Plus size={12} className="text-[#002B5E]" />
          </button>
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
    </div>
  );
}
