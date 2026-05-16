"use client";

import React from "react";
import { ArrowLeftRight, UserCircle2 } from "lucide-react";
import type { MockSticker, MockSuggestion } from "@/data/types";

interface StickerSlotProps {
  sticker: MockSticker;
  label: string;
  accent?: boolean;
}

function StickerSlot({ sticker, label, accent }: StickerSlotProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span
        className={`text-[9px] font-bold uppercase tracking-widest ${
          accent ? "text-[#BF0A30]" : "text-slate-400"
        }`}
      >
        {label}
      </span>
      <div
        className={`relative rounded-xl overflow-hidden border-2 ${
          accent ? "border-[#BF0A30]/40" : "border-slate-200"
        }`}
      >
        <img
          src={sticker.player.image}
          alt={sticker.player.name}
          className="w-20 h-20 object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
          <p className="text-white text-[10px] font-bold leading-tight text-center truncate">
            {sticker.player.name}
          </p>
          <p className="text-white/70 text-[8px] text-center truncate">
            {sticker.player.nationalTeam?.name}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: MockSuggestion;
  onAccept: () => void;
  onReject: () => void;
}

export default function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: SuggestionCardProps) {
  const { from, theirSticker, yourSticker, createdAt } = suggestion;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#002B5E] bg-blue-50 px-2.5 py-1 rounded-full">
          Sugerencia
        </span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <UserCircle2 size={13} />
          <span className="text-xs font-medium text-slate-500">{from.name}</span>
          <span className="text-[10px] text-slate-300 ml-1">
            {new Date(createdAt).toLocaleDateString("es-AR")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-4">
        <StickerSlot sticker={yourSticker} label="Ofrecés" accent />
        <div className="flex-shrink-0 text-slate-300">
          <ArrowLeftRight size={16} />
        </div>
        <StickerSlot sticker={theirSticker} label="Recibís" />
      </div>

      <div className="flex items-center justify-center gap-4 px-4 pb-4">
        <button
          onClick={onReject}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          Ignorar
        </button>
        <button
          onClick={onAccept}
          className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#002B5E] hover:bg-[#003a7a] rounded-xl transition-colors"
        >
          Proponer
        </button>
      </div>
    </div>
  );
}
