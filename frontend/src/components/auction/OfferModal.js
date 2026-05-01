"use client";

import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import StickerCard from "@/components/sticker/StickerCard";
import StickerFace from "@/components/sticker/StickerFace";
import StickerRow from "@/components/common/StickerRow";

function SelectableSticker({ item, selected, onToggle, requiredQuantity }) {
  const { sticker, quantity } = item;
  const hasEnough = requiredQuantity ? quantity >= requiredQuantity : true;

  return (
    <button
      onClick={() => hasEnough && onToggle(sticker.number)}
      disabled={!hasEnough}
      className={`group relative w-full aspect-[4/5] bg-white p-2 transition-all duration-150 ${
        selected
          ? "ring-2 ring-[#002B5E] ring-offset-1 shadow-md"
          : hasEnough
            ? "ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-md"
            : "ring-1 ring-red-200 opacity-60 cursor-not-allowed"
      }`}
    >
      <StickerFace sticker={sticker} />

      {selected && (
        <div className="absolute inset-0 bg-[#002B5E]/20 flex items-center justify-center pointer-events-none z-30">
          <div className="w-8 h-8 rounded-full bg-[#002B5E] shadow-lg flex items-center justify-center">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {quantity > 1 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white bg-gray-900 shadow-md z-30">
          x{quantity}
        </div>
      )}

      {!hasEnough && requiredQuantity && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max px-2 py-0.5 rounded-full flex items-center justify-center font-bold text-[9px] text-white bg-red-500 shadow-md z-30">
          Faltan {requiredQuantity - quantity}
        </div>
      )}
    </button>
  );
}

export default function OfferModal({ post, myCollection, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);

  const { sticker, owner, minimumRequirements } = post;
  const isShiny = sticker.category === "SHINY";
  const isAuction = !!minimumRequirements;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  function toggleSticker(number) {
    setSelected(prev =>
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  }

  const availableStickers = myCollection.filter(item => {
    if (item.quantity <= 0) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sticker.player.name.toLowerCase().includes(q) ||
      (item.sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
      (item.sticker.player.club?.name || "").toLowerCase().includes(q)
    );
  });

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
    <div className="fixed inset-0 z-50 flex md:flex-row items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white flex flex-col overflow-hidden w-full h-full md:h-[80vh] md:max-h-[800px] md:w-[900px] md:max-w-[95vw] md:rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">
              {isAuction ? "Participar en subasta" : "Proponer intercambio"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">con {owner.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sticker en juego */}
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

          {/* Selector de figuritas */}
          <div className="flex flex-col flex-1 px-4 py-4 md:px-6 md:py-5 bg-white overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Elegí qué ofrecés</p>
              {selected.length > 0 && (
                <span className="text-sm font-bold text-[#002B5E] bg-blue-50 px-2 py-0.5 rounded">
                  {selected.length} seleccionada{selected.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="relative mb-4 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por jugador, selección o club..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all rounded-md"
              />
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
                    <SelectableSticker
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
      </div>
    </div>
  );
}
