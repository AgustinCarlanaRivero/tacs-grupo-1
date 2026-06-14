"use client";

import React from "react";
import StickerCard from "@/components/sticker/StickerCard";
import OwnerBadge from "@/components/common/OwnerBadge";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";
import { Clock, AlertCircle } from "lucide-react";
import type { AuctionPostDTO } from "@/lib/schemas/postSchema";

interface AuctionCardProps {
  auction: AuctionPostDTO;
  onSelect: (auction: AuctionPostDTO) => void;
  isOwner?: boolean;
}

export default function AuctionCard({ auction, onSelect, isOwner = false }: AuctionCardProps) {
  const { sticker, owner, endsAt, minimumRequirement } = auction;
  const isShiny = sticker.type === "SHINY";
  const timeLeftMs = useCountdown(endsAt);
  const isEnded = timeLeftMs <= 0;

  return (
    <div
      className={`flex flex-col md:flex-row bg-white border ${
        isEnded ? "border-red-200 opacity-80" : "border-slate-200"
      }`}
    >
      <div className="p-3 flex items-center justify-center">
        <div className="w-48">
          <StickerCard sticker={sticker} />
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
            <OwnerBadge name={owner.username} />
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className={isEnded ? "text-red-500" : "text-slate-400"} />
            <span className={`text-md font-bold ${isEnded ? "text-red-600" : "text-slate-700"}`}>
              {formatCountdown(timeLeftMs)}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col md:min-w-[260px]">
          <p className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-blue-500" /> Requisito mínimo
          </p>
          {minimumRequirement ? (
            <p className="text-sm font-semibold text-slate-700 mb-4">
              Mínimo {minimumRequirement} figurita{minimumRequirement > 1 ? "s" : ""} en la oferta
            </p>
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
