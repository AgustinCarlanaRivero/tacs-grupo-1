import React from "react";
import PlayerImage from "@/components/sticker/PlayerImage";
import ShinyOverlays from "@/components/sticker/ShinyOverlays";
import NumberBadge from "@/components/sticker/NumberBadge";
import { PlayerInfoOverlay } from "@/components/sticker/PlayerInfo";
import type { MockSticker } from "@/data/types";

interface StickerFaceProps {
  sticker: MockSticker;
  imageClassName?: string;
}

export function ShinyFace({ sticker, imageClassName }: StickerFaceProps) {
  return (
    <div className="aspect-[4/5] border border-slate-200 bg-slate-100 relative overflow-hidden flex flex-col">
      <PlayerImage src={sticker.player.image} alt={sticker.player.name} className={imageClassName} />
      <ShinyOverlays />
      <NumberBadge number={sticker.number} variant="shiny" />
      <PlayerInfoOverlay player={sticker.player} variant="shiny" />
    </div>
  );
}

export function RegularFace({ sticker, imageClassName }: StickerFaceProps) {
  const country = sticker.player.nationalTeam?.name || "COUNTRY";
  const club = sticker.player.club?.name || "CLUB";

  return (
    <div className="aspect-[4/5] border border-slate-200 bg-slate-100 relative overflow-hidden flex flex-col">
      <div className="bg-[#002B5E] flex items-center justify-between px-2.5 py-1 shrink-0">
        <span className="text-white font-black text-xs tracking-wider">#{sticker.number}</span>
        <span className="text-blue-200 font-bold text-[9px] uppercase tracking-widest">
          {country}
        </span>
      </div>
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#002B5E] to-[#001a3a]">
        <PlayerImage src={sticker.player.image} alt={sticker.player.name} className={imageClassName} />
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

export default function StickerFace({ sticker, imageClassName }: StickerFaceProps) {
  return sticker.category === "SHINY" ? (
    <ShinyFace sticker={sticker} imageClassName={imageClassName} />
  ) : (
    <RegularFace sticker={sticker} imageClassName={imageClassName} />
  );
}
