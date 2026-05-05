"use client";

import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import ModalShell from "@/components/common/ModalShell";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import SelectableStickerOption from "@/components/sticker/SelectableStickerOption";
import StickerCard from "@/components/sticker/StickerCard";
import StickerRow from "@/components/common/StickerRow";
import { filterStickers } from "@/lib/utils";

export default function OfferModal({ post, myCollection, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);

  const { sticker, owner, minimumRequirements } = post;
  const isShiny = sticker.category === "SHINY";
  const isAuction = !!minimumRequirements;

  function toggleSticker(sticker) {
    setSelected(prev =>
      prev.includes(sticker.number)
        ? prev.filter(n => n !== sticker.number)
        : [...prev, sticker.number]
    );
  }

  const availableStickers = filterStickers(
    myCollection.filter(item => item.quantity > 0),
    searchQuery
  );

  let canSubmit = selected.length > 0;
  let validationMessage = "";

  if (isAuction && minimumRequirements.length > 0) {
    const missing = minimumRequirements.filter(req => {
      if (!selected.includes(req.sticker.number)) return true;
      const item = myCollection.find(c => c.sticker.number === req.sticker.number);
      return !item || item.quantity < req.quantity;
    });
    if (missing.length > 0) {
      canSubmit = false;
      validationMessage = "Debés seleccionar todas las figuritas requeridas para esta subasta.";
    }
  }

  return (
    <ModalShell
      title={isAuction ? "Participar en subasta" : "Proponer intercambio"}
      subtitle={`con ${owner.name}`}
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
              <p className="font-bold text-slate-800 text-base md:text-lg leading-tight">{sticker.player.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {sticker.player.nationalTeam?.name} · {sticker.player.club?.name}
              </p>
              <span className={`inline-block mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded ${isShiny ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"}`}>
                {isShiny ? "✦ Shiny" : "Regular"}
              </span>
            </div>
          </div>

          {isAuction && minimumRequirements.length > 0 && (
            <div className="mt-4 border-t border-slate-200/60">
              <button
                onClick={() => setShowRequirements(!showRequirements)}
                className="w-full flex items-center justify-between pt-4 pb-2 group"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 group-hover:text-[#002B5E] transition-colors">
                  <AlertCircle size={12} className="text-blue-500" /> Requisitos mínimos
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm text-[9px] ml-1">{minimumRequirements.length}</span>
                </p>
                {showRequirements
                  ? <ChevronUp size={14} className="text-slate-400 group-hover:text-[#002B5E]" />
                  : <ChevronDown size={14} className="text-slate-400 group-hover:text-[#002B5E]" />
                }
              </button>
              {showRequirements && (
                <div className="flex flex-col gap-2 pt-2">
                  {minimumRequirements.map(req => (
                    <StickerRow key={req.sticker.number} sticker={req.sticker} quantity={req.quantity} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 px-4 py-4 md:px-6 md:py-5 bg-white overflow-y-auto overscroll-contain">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Elegí qué ofrecés</p>
            {selected.length > 0 && (
              <span className="text-sm font-bold text-[#002B5E] bg-blue-50 px-2 py-0.5 rounded">
                {selected.length} seleccionada{selected.length > 1 ? "s" : ""}
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
                {searchQuery ? "No se encontraron figuritas." : "No tenés figuritas disponibles para ofrecer."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableStickers.map(item => {
                const req = isAuction ? minimumRequirements?.find(r => r.sticker.number === item.sticker.number) : null;
                return (
                  <SelectableStickerOption
                    key={item.sticker.number}
                    item={item}
                    selected={selected.includes(item.sticker.number)}
                    onToggle={toggleSticker}
                    requiredQuantity={req?.quantity}
                  />
                );
              })}
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
          onClick={() => { onSubmit(selected); onClose(); }}
          className="w-full py-3.5 md:py-4 rounded-lg text-sm md:text-base font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {selected.length === 0
            ? "Seleccioná figuritas para ofrecer"
            : `Enviar propuesta · ${selected.length} figurita${selected.length > 1 ? "s" : ""}`
          }
        </button>
      </div>
    </ModalShell>
  );
}
