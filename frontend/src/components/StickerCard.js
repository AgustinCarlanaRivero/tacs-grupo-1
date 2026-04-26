"use client";

import React, { useState } from "react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import NumberBadge from "@/components/sticker/NumberBadge";
import { PlayerInfoOverlay } from "@/components/sticker/PlayerInfo";
import PlayerImage from "@/components/sticker/PlayerImage";
import ShinyOverlays from "@/components/sticker/ShinyOverlays";
import StickerModal from "@/components/sticker/StickerModal";

const CARD_BASE = "group relative w-full aspect-[4/5] bg-white p-[6px] shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer";

function ShinyCard({ sticker }) {
  return (
    <div className="relative w-full h-full overflow-hidden ring-1 ring-yellow-400/50">
      <PlayerImage src={sticker.player.image} alt={sticker.player.name} className="transition-transform duration-500 group-hover:scale-[1.05]" />
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
        <PlayerImage src={sticker.player.image} alt={sticker.player.name} className="transition-transform duration-300 group-hover:scale-[1.04]" />
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

export default function StickerCard({ item }) {
  const [showModal, setShowModal] = useState(false);
  const { sticker, quantity } = item;
  const isShiny = sticker.category === "SHINY";

  return (
    <>
      <div className={CARD_BASE} onClick={() => setShowModal(true)}>
        <QuantityBadge quantity={quantity} />
        {isShiny ? <ShinyCard sticker={sticker} /> : <RegularCard sticker={sticker} />}
      </div>

      {showModal && (
        <StickerModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
