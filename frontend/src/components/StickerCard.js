import React from "react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import NumberBadge from "@/components/sticker/NumberBadge";
import PlayerInfo from "@/components/sticker/PlayerInfo";
import PlayerImage from "@/components/sticker/PlayerImage";
import ShinyOverlays from "@/components/sticker/ShinyOverlays";

const CARD_BASE = "group relative w-full aspect-[4/5] bg-white p-[6px] shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer";

function ShinyCard({ sticker }) {
  return (
    <div className="relative w-full h-full overflow-hidden ring-1 ring-yellow-400/50">
      <PlayerImage src={sticker.player.image} alt={sticker.player.name} className="transition-transform duration-500 group-hover:scale-[1.05]" />
      <ShinyOverlays />
      <NumberBadge number={sticker.number} variant="shiny" />
      <PlayerInfo player={sticker.player} variant="shiny" />
    </div>
  );
}

function RegularCard({ sticker }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col border border-slate-200/50">
      <div className="relative flex-[7] w-full overflow-hidden bg-gradient-to-b from-sky-600 to-blue-800">
        <PlayerImage src={sticker.player.image} alt={sticker.player.name} className="transition-transform duration-300 group-hover:scale-[1.04]" />
        <NumberBadge number={sticker.number} variant="regular" />
      </div>
      <PlayerInfo player={sticker.player} variant="regular" />
    </div>
  );
}

export default function StickerCard({ item }) {
  const { sticker, quantity } = item;
  const isShiny = sticker.category === "SHINY";

  return (
    <div className={CARD_BASE}>
      <QuantityBadge quantity={quantity} />
      {isShiny ? <ShinyCard sticker={sticker} /> : <RegularCard sticker={sticker} />}
    </div>
  );
}
