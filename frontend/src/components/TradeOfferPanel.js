"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import PlayerImage from "@/components/sticker/PlayerImage";
import ShinyOverlays from "@/components/sticker/ShinyOverlays";
import NumberBadge from "@/components/sticker/NumberBadge";
import { PlayerInfoOverlay } from "@/components/sticker/PlayerInfo";

function ShinyCardInner({ sticker }) {
  return (
    <div className="relative w-full h-full overflow-hidden ring-1 ring-yellow-400/50">
      <PlayerImage src={sticker.player.image} alt={sticker.player.name} />
      <ShinyOverlays />
      <NumberBadge number={sticker.number} variant="shiny" />
      <PlayerInfoOverlay player={sticker.player} variant="shiny" />
    </div>
  );
}

function RegularCardInner({ sticker }) {
  const country = sticker.player.nationalTeam?.name || "COUNTRY";
  const club = sticker.player.club?.name || "CLUB";

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <div className="bg-[#002B5E] flex items-center justify-between px-2.5 py-1 shrink-0">
        <span className="text-white font-black text-xs tracking-wider">#{sticker.number}</span>
        <span className="text-blue-200 font-bold text-[9px] uppercase tracking-widest truncate max-w-[55px]">{country}</span>
      </div>
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#002B5E] to-[#001a3a]">
        <PlayerImage src={sticker.player.image} alt={sticker.player.name} />
      </div>
      <div className="bg-[#003a7a] px-2.5 py-2 shrink-0">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] leading-tight break-words text-center">
          {sticker.player.name}
        </h3>
      </div>
      <div className="bg-[#002B5E] px-2.5 py-1 shrink-0 flex items-center justify-center">
        <span className="text-[10px] font-medium text-blue-200 uppercase tracking-wider truncate">{club}</span>
      </div>
    </div>
  );
}

function SelectableSticker({ item, selected, onToggle }) {
  const { sticker, quantity } = item;
  const isShiny = sticker.category === "SHINY";

  return (
    <button
      onClick={() => onToggle(sticker.number)}
      className={`group relative w-full aspect-[4/5] bg-white p-[3px] transition-all duration-150 ${
        selected
          ? "ring-2 ring-[#002B5E] ring-offset-1 shadow-md"
          : "ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-md"
      }`}
    >
      {isShiny ? <ShinyCardInner sticker={sticker} /> : <RegularCardInner sticker={sticker} />}

      {/* Selection overlay */}
      {selected && (
        <div className="absolute inset-0 bg-[#002B5E]/20 flex items-center justify-center pointer-events-none z-30">
          <div className="w-8 h-8 rounded-full bg-[#002B5E] shadow-lg flex items-center justify-center">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Quantity badge */}
      {quantity > 1 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white bg-gray-900 shadow-md z-30">
          x{quantity}
        </div>
      )}
    </button>
  );
}

export default function TradeOfferPanel({ trade, myCollection, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const { sticker, owner } = trade;
  const isShiny = sticker.category === "SHINY";

  function toggleSticker(number) {
    setSelected(prev =>
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  }

  const availableStickers = myCollection.filter(item => item.quantity > 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden
        bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]
        md:left-auto md:right-0 md:top-14 md:bottom-0 md:w-96 md:max-h-none md:rounded-none md:rounded-tl-xl">

        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-8 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Proponer intercambio</h3>
            <p className="text-xs text-slate-500 mt-0.5">con {owner.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Wanted sticker preview */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
            Figurita que querés
          </p>
          <div className="flex items-center gap-3">
            {/* Mini sticker card — misma estética */}
            <div className="w-16 shrink-0">
              <div className="group relative w-full aspect-[4/5] bg-white p-[4px] shadow-md border border-slate-200">
                {isShiny ? <ShinyCardInner sticker={sticker} /> : <RegularCardInner sticker={sticker} />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight">{sticker.player.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {sticker.player.nationalTeam?.name} · {sticker.player.club?.name}
              </p>
              <span className={`inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 ${
                isShiny ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
              }`}>
                {isShiny ? "✦ Shiny" : "Regular"}
              </span>
            </div>
          </div>
        </div>

        {/* Collection picker */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Elegí qué ofrecés
            {selected.length > 0 && (
              <span className="ml-2 text-[#002B5E]">
                · {selected.length} seleccionada{selected.length > 1 ? "s" : ""}
              </span>
            )}
          </p>
          {availableStickers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No tenés figuritas disponibles para ofrecer.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableStickers.map(item => (
                <SelectableSticker
                  key={item.sticker.number}
                  item={item}
                  selected={selected.includes(item.sticker.number)}
                  onToggle={toggleSticker}
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white">
          <button
            disabled={selected.length === 0}
            onClick={() => { onSubmit(selected); onClose(); }}
            className="w-full py-3 text-sm font-bold uppercase tracking-wide transition-colors
              bg-[#002B5E] hover:bg-[#003a7a] text-white
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selected.length === 0
              ? "Seleccioná figuritas para ofrecer"
              : `Enviar propuesta · ${selected.length} figurita${selected.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}
