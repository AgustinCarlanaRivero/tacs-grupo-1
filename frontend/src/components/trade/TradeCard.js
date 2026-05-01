"use client";

import React from "react";
import StickerFace from "@/components/sticker/StickerFace";

export default function TradeCard({ trade, onSelect, isOwner = false }) {
  const { sticker, owner } = trade;
  const initials = owner.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group flex flex-col border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
      <div className="relative w-full aspect-[4/5] bg-white p-[6px]">
        <StickerFace sticker={sticker} />
      </div>

      <div className="bg-white px-3 pt-2 pb-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#002B5E] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white">{initials}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">{owner.name}</span>
        </div>
        <button
          onClick={() => onSelect(trade)}
          className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            isOwner
              ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              : "bg-[#002B5E] hover:bg-[#003a7a] text-white"
          }`}
        >
          {isOwner ? "Cancelar" : "Intercambiar"}
        </button>
      </div>
    </div>
  );
}
