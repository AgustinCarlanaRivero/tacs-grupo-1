"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Search } from "lucide-react";
import StickerFace from "@/components/sticker/StickerFace";

function StickerOption({ item, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item.sticker)}
      className={`relative w-full aspect-[4/5] transition-all duration-150 ${
        selected
          ? "ring-2 ring-[#002B5E] ring-offset-1 shadow-md"
          : "ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-md"
      }`}
    >
      <StickerFace sticker={item.sticker} />
      {selected && (
        <div className="absolute inset-0 bg-[#002B5E]/20 flex items-center justify-center pointer-events-none z-30">
          <div className="w-8 h-8 rounded-full bg-[#002B5E] shadow-lg flex items-center justify-center">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}
      {item.quantity > 1 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white bg-gray-900 shadow-md z-30">
          x{item.quantity}
        </div>
      )}
    </button>
  );
}

export default function CreateTradeModal({ myCollection, onClose, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const available = myCollection.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sticker.player.name.toLowerCase().includes(q) ||
      (item.sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
      (item.sticker.player.club?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white flex flex-col overflow-hidden w-full h-full md:h-[80vh] md:max-h-[700px] md:w-[580px] md:max-w-[95vw] md:rounded-xl shadow-2xl">

        <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">Publicar intercambio</h3>
            <p className="text-sm text-slate-500 mt-0.5">Elegí la figurita que querés ofrecer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
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

          {available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-base text-slate-500">
                {searchQuery ? "No se encontraron figuritas." : "No tenés figuritas disponibles."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {available.map(item => (
                <StickerOption
                  key={item.sticker.number}
                  item={item}
                  selected={selected?.number === item.sticker.number}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 p-4 md:p-6 border-t border-slate-100">
          <button
            disabled={!selected}
            onClick={() => { onSubmit(selected); onClose(); }}
            className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {selected ? `Publicar · ${selected.player.name}` : "Seleccioná una figurita"}
          </button>
        </div>
      </div>
    </div>
  );
}
