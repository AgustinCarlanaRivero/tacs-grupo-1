"use client";

import React from "react";
import StickerCard from "@/components/sticker/StickerCard";
import OwnerBadge from "@/components/common/OwnerBadge";
import type { DirectTradePostDTO } from "@/lib/schemas/postSchema";

interface TradeCardProps {
  trade: DirectTradePostDTO;
  onSelect: (trade: DirectTradePostDTO) => void;
  isOwner?: boolean;
}

export default function TradeCard({ trade, onSelect, isOwner = false }: TradeCardProps) {
  const { sticker, owner } = trade;

  return (
    <div className="flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
      <StickerCard sticker={sticker} />
      <div className="bg-white px-3 pt-2 pb-3 border border-t-0 border-slate-200 flex flex-col gap-2">
        <OwnerBadge name={owner.username} />
        <button
          onClick={() => onSelect(trade)}
          className="w-full py-2 bg-[#002B5E] hover:bg-[#003a7a] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
        >
          {isOwner ? "Ver ofertas" : "Intercambiar"}
        </button>
      </div>
    </div>
  );
}
