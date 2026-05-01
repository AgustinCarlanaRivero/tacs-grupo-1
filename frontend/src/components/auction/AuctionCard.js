"use client";

import React from "react";
import StickerFace from "@/components/sticker/StickerFace";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";
import { Clock, AlertCircle } from "lucide-react";

function OwnerBadge({ name }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-[#002B5E] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{initials}</span>
      </div>
      <span className="text-md text-slate-600 font-medium">{name}</span>
    </div>
  );
}

function RequirementRow({ req }) {
  const isShiny = req.sticker.category === "SHINY";
  return (
    <div className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded border border-slate-200 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-slate-500">#{req.sticker.number}</span>
        <span className="font-medium text-slate-700 truncate">{req.sticker.player.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${isShiny ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
          {isShiny ? "Shiny" : "Regular"}
        </span>
        <span className="font-black bg-[#002B5E] text-white px-2 py-0.5 rounded">x{req.quantity}</span>
      </div>
    </div>
  );
}

export default function AuctionCard({ auction, onSelect, isOwner = false }) {
  const { sticker, owner, endsAt, minimumRequirements } = auction;
  const isShiny = sticker.category === "SHINY";
  const timeLeftMs = useCountdown(endsAt);
  const isEnded = timeLeftMs <= 0;

  return (
    <div className={`flex flex-col md:flex-row bg-white border ${isEnded ? "border-red-200 opacity-80" : "border-slate-200"}`}>
      <div className="p-3 flex items-center justify-center">
        <div className="w-48 p-2 border aspect-[4/5] flex items-center justify-center">
          <StickerFace sticker={sticker} />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-2xl">{sticker.player.name}</h3>
            {isShiny && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                Shiny
              </span>
            )}
          </div>
          <p className="text-md text-slate-500 mb-4">
            {sticker.player.nationalTeam?.name} · {sticker.player.club?.name}
          </p>
          <div className="mb-4">
            <OwnerBadge name={owner.name} />
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className={isEnded ? "text-red-500" : "text-slate-400"} />
            <span className={`text-md font-bold ${isEnded ? "text-red-600" : "text-slate-700"}`}>
              {formatCountdown(timeLeftMs)}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col md:min-w-[300px]">
          <p className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-blue-500" /> Requisitos
          </p>
          {minimumRequirements?.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {minimumRequirements.map(req => (
                <RequirementRow key={req.sticker.number} req={req} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-4">Sin requisitos</p>
          )}
          <div className="mt-auto pt-2">
            <button
              disabled={!isOwner && isEnded}
              onClick={() => onSelect(auction)}
              className={`w-full py-3 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                isOwner
                  ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                  : isEnded
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#002B5E] hover:bg-[#003a7a] text-white"
              }`}
            >
              {isOwner ? "Cancelar subasta" : isEnded ? "Cerrada" : "Pujar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
