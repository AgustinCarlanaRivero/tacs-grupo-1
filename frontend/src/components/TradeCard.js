"use client";

import React from "react";
import PlayerImage from "@/components/sticker/PlayerImage";
import ShinyOverlays from "@/components/sticker/ShinyOverlays";
import NumberBadge from "@/components/sticker/NumberBadge";
import { PlayerInfoOverlay } from "@/components/sticker/PlayerInfo";

function ShinyCard({ sticker }) {
  return (
    <div className="relative w-full h-full overflow-hidden ring-1 ring-yellow-400/50">
      <PlayerImage
        src={sticker.player.image}
        alt={sticker.player.name}
        className="transition-transform duration-500 group-hover:scale-[1.05]"
      />
      <ShinyOverlays />
      <NumberBadge number={sticker.number} variant="shiny" />
      <PlayerInfoOverlay player={sticker.player} variant="shiny" />
    </div>
  );
}

function RegularCard({ sticker }) {
  const country = sticker.player.nationalTeam?.name || "COUNTRY";
  const club = sticker.player.club?.name || "CLUB";

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <div className="bg-[#002B5E] flex items-center justify-between px-2.5 py-1 shrink-0">
        <span className="text-white font-black text-xs tracking-wider">#{sticker.number}</span>
        <span className="text-blue-200 font-bold text-[9px] uppercase tracking-widest">{country}</span>
      </div>
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#002B5E] to-[#001a3a]">
        <PlayerImage
          src={sticker.player.image}
          alt={sticker.player.name}
          className="transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="bg-[#003a7a] px-2.5 py-2 shrink-0">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] leading-tight break-words text-center">
          {sticker.player.name}
        </h3>
      </div>
      <div className="bg-[#002B5E] px-2.5 py-1 shrink-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">{club}</span>
      </div>
    </div>
  );
}

export default function TradeCard({ trade, onSelect }) {
  const { sticker, owner } = trade;
  const isShiny = sticker.category === "SHINY";
  const initials = owner.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group flex flex-col border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Sticker — mismo estilo que StickerCard */}
      <div className="relative w-full aspect-[4/5] bg-white p-[6px]">
        {isShiny ? <ShinyCard sticker={sticker} /> : <RegularCard sticker={sticker} />}
      </div>

      {/* Footer: dueño + acción */}
      <div className="bg-white px-3 pt-2 pb-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#002B5E] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white">{initials}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium truncate">{owner.name}</span>
        </div>
        <button
          onClick={() => onSelect(trade)}
          className="w-full py-2 bg-[#002B5E] hover:bg-[#003a7a] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
        >
          Intercambiar
        </button>
      </div>
    </div>
  );
}
