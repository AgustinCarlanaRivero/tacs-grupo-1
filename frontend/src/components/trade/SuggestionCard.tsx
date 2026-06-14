"use client";

import React from "react";
import { UserCircle2 } from "lucide-react";
import type { SuggestionDTO } from "@/store/api/matchingApi";

interface SuggestionCardProps {
  suggestion: SuggestionDTO;
  onAccept: () => void;
  onReject: () => void;
}

export default function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: SuggestionCardProps) {
  const { username, offerableStickers } = suggestion;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#002B5E] bg-blue-50 px-2.5 py-1 rounded-full">
          Sugerencia
        </span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <UserCircle2 size={13} />
          <span className="text-xs font-medium text-slate-500">{username}</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 mb-2">
          Puede ofrecer:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {offerableStickers.slice(0, 4).map((s) => (
            <span
              key={s.number}
              className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
            >
              #{s.number} {s.title}
            </span>
          ))}
          {offerableStickers.length > 4 && (
            <span className="text-[10px] text-slate-400">
              +{offerableStickers.length - 4} más
            </span>
          )}
        </div>
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
