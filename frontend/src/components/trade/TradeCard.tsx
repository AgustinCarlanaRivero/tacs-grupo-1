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
  const { sticker, owner, quantity } = trade;
  const isClosed = trade.state === "CLOSED";
  const isCompleted = trade.state === "COMPLETED";
  const isTerminal = isClosed || isCompleted;

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${
      isTerminal ? "opacity-75" : "hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    }`}>
      {quantity && quantity > 1 && (
        <div className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] text-white bg-gray-900 shadow-md">
          x{quantity}
        </div>
      )}
      {isClosed && (
        <div className="absolute top-1 left-1 z-10 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-600 border border-slate-300 shadow-sm">
          Cerrada
        </div>
      )}
      {isCompleted && (
        <div className="absolute top-1 left-1 z-10 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 shadow-sm">
          Completada
        </div>
      )}
      <StickerCard sticker={sticker} />
      <div className="bg-white px-3 pt-2 pb-3 border border-t-0 border-slate-200 flex flex-col gap-2">
        <OwnerBadge name={owner.username} />
        <button
          onClick={() => onSelect(trade)}
          disabled={!isOwner && isTerminal}
          className="w-full py-2 bg-[#002B5E] hover:bg-[#003a7a] text-white text-[10px] font-bold uppercase tracking-wider transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isOwner ? "Ver ofertas" : isClosed ? "Cerrada" : isCompleted ? "Completada" : "Intercambiar"}
        </button>
      </div>
    </div>
  );
}
