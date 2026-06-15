"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import ModalShell from "@/components/common/ModalShell";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import SelectableStickerOption from "@/components/sticker/SelectableStickerOption";
import StickerCard from "@/components/sticker/StickerCard";
import { filterStickers } from "@/lib/utils";
import type { MockCollectionItem } from "@/data/types";
import type { MockSticker } from "@/data/types";

export interface OfferPost {
  sticker: MockSticker;
  owner: { id: string | number; username: string };
  minimumRequirement?: number;
}

export interface OfferSubmitItem {
  stickerId: number;
  quantity: number;
}

interface OfferModalProps {
  post: OfferPost;
  myCollection: MockCollectionItem[];
  onClose: () => void;
  onSubmit: (offered: OfferSubmitItem[]) => Promise<void> | void;
}

export default function OfferModal({ post, myCollection, onClose, onSubmit }: OfferModalProps) {
  // stickerNumber -> cantidad elegida a ofrecer
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { sticker, owner, minimumRequirement } = post;
  const isShiny = sticker.type === "SHINY";
  const isAuction = minimumRequirement !== undefined;
  const selectedCount = Object.keys(selected).length;

  function toggleSticker(sticker: MockSticker) {
    setSelected((prev) => {
      if (prev[sticker.number] !== undefined) {
        const next = { ...prev };
        delete next[sticker.number];
        return next;
      }
      return { ...prev, [sticker.number]: 1 };
    });
  }

  function setStickerQuantity(sticker: MockSticker, quantity: number) {
    setSelected((prev) => ({ ...prev, [sticker.number]: quantity }));
  }

  const availableStickers = filterStickers(
    myCollection.filter((item) => item.quantity > 0),
    searchQuery
  );

  let canSubmit = selectedCount > 0;
  let validationMessage = "";

  if (isAuction && minimumRequirement && selectedCount < minimumRequirement) {
    canSubmit = false;
    validationMessage = `Debés seleccionar al menos ${minimumRequirement} figurita${minimumRequirement > 1 ? "s" : ""} para esta subasta.`;
  }

  return (
    <ModalShell
      title={isAuction ? "Participar en subasta" : "Proponer intercambio"}
      subtitle={`con ${owner.username}`}
      onClose={onClose}
      wide
    >
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="md:w-1/3 lg:w-2/5 flex flex-col shrink-0 px-4 py-4 md:px-6 md:py-5 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 md:overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Figurita en juego
          </p>
          <div className="flex flex-row md:flex-col items-center md:items-start gap-4">
            <div className="w-48">
              <StickerCard sticker={sticker} />
            </div>
            <div className="flex-1 min-w-0 md:w-full">
              <p className="font-bold text-slate-800 text-base md:text-lg leading-tight">
                {sticker.player.name}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {sticker.player.nationalTeam?.name} · {sticker.player.club?.name}
              </p>
              <span
                className={`inline-block mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded ${
                  isShiny ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {isShiny ? "✦ Shiny" : "Regular"}
              </span>
            </div>
          </div>

          {isAuction && minimumRequirement && (
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1">
                <AlertCircle size={12} className="text-blue-500" /> Requisito mínimo
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {minimumRequirement} figurita{minimumRequirement > 1 ? "s" : ""} como mínimo
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 px-4 py-4 md:px-6 md:py-5 bg-white overflow-y-auto overscroll-contain">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Elegí qué ofrecés
            </p>
            {selectedCount > 0 && (
              <span className="text-sm font-bold text-[#002B5E] bg-blue-50 px-2 py-0.5 rounded">
                {selectedCount} seleccionada{selectedCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="mb-4 shrink-0">
            <StickerSearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>

          {availableStickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-2xl">😢</span>
              </div>
              <p className="text-base text-slate-500">
                {searchQuery
                  ? "No se encontraron figuritas."
                  : "No tenés figuritas disponibles para ofrecer."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableStickers.map((item) => (
                <SelectableStickerOption
                  key={item.sticker.number}
                  item={item}
                  selected={selected[item.sticker.number] !== undefined}
                  selectedQuantity={selected[item.sticker.number] ?? 1}
                  onToggle={toggleSticker}
                  onQuantityChange={setStickerQuantity}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 p-4 md:p-6 border-t border-slate-100 bg-white">
        {!canSubmit && validationMessage && (
          <p className="text-xs text-red-500 font-medium text-center mb-3">{validationMessage}</p>
        )}
        <button
          disabled={!canSubmit}
          onClick={async () => {
            const offered = Object.entries(selected).map(([stickerId, quantity]) => ({
              stickerId: Number(stickerId),
              quantity,
            }));
            await onSubmit(offered);
            onClose();
          }}
          className="w-full py-3.5 md:py-4 rounded-lg text-sm md:text-base font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {selectedCount === 0
            ? "Seleccioná figuritas para ofrecer"
            : `Enviar propuesta · ${selectedCount} figurita${selectedCount > 1 ? "s" : ""}`}
        </button>
      </div>
    </ModalShell>
  );
}
