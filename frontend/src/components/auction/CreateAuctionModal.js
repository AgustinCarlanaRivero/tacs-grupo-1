"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Search, Plus, Minus, Trash2, Clock } from "lucide-react";
import StickerFace from "@/components/sticker/StickerFace";

const DURATIONS = [
  { label: "1 hora", hours: 1 },
  { label: "6 horas", hours: 6 },
  { label: "24 horas", hours: 24 },
  { label: "48 horas", hours: 48 },
];

const STEP_LABELS = ["Figurita", "Requisitos", "Duración"];

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

function StepSticker({ myCollection, selected, onSelect }) {
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex flex-col h-full gap-4">
      <div className="relative shrink-0">
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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-base text-slate-500 text-center">
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
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StepRequirements({ catalog, requirements, onAdd, onRemove, onChangeQty }) {
  const [searchQuery, setSearchQuery] = useState("");

  const addedNumbers = requirements.map(r => r.sticker.number);

  const results = searchQuery.length > 0
    ? catalog.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.sticker.player.name.toLowerCase().includes(q) ||
          (item.sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
          (item.sticker.player.club?.name || "").toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500">Especificá qué figuritas querés recibir. Podés dejarlo vacío.</p>

      <div className="relative shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar figurita para agregar como requisito..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all rounded-md"
        />
      </div>

      {results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shrink-0">
          {results.slice(0, 5).map(item => {
            const alreadyAdded = addedNumbers.includes(item.sticker.number);
            return (
              <button
                key={item.sticker.number}
                onClick={() => { if (!alreadyAdded) { onAdd(item.sticker); setSearchQuery(""); } }}
                disabled={alreadyAdded}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b last:border-b-0 border-slate-100 transition-colors ${
                  alreadyAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-8 shrink-0 aspect-[4/5]">
                  <StickerFace sticker={item.sticker} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.sticker.player.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {item.sticker.player.nationalTeam?.name} · {item.sticker.player.club?.name}
                  </p>
                </div>
                {alreadyAdded
                  ? <Check size={14} className="text-slate-400 shrink-0" />
                  : <Plus size={14} className="text-[#002B5E] shrink-0" />
                }
              </button>
            );
          })}
        </div>
      )}

      {requirements.length === 0 ? (
        <div className="py-8 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-400 italic">Sin requisitos — cualquier figurita será válida</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {requirements.map(req => (
            <div key={req.sticker.number} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-8 shrink-0 aspect-[4/5]">
                <StickerFace sticker={req.sticker} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{req.sticker.player.name}</p>
                <p className="text-xs text-slate-400 truncate">{req.sticker.player.nationalTeam?.name}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onChangeQty(req.sticker.number, -1)}
                  className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="text-sm font-bold text-slate-700 w-4 text-center">{req.quantity}</span>
                <button
                  onClick={() => onChangeQty(req.sticker.number, +1)}
                  className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>
              <button
                onClick={() => onRemove(req.sticker.number)}
                className="ml-1 p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepDuration({ duration, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">¿Cuánto tiempo estará activa la subasta?</p>
      <div className="grid grid-cols-2 gap-3">
        {DURATIONS.map(d => (
          <button
            key={d.hours}
            onClick={() => onSelect(d.hours)}
            className={`flex flex-col items-center justify-center gap-2 py-8 border-2 rounded-2xl transition-all ${
              duration === d.hours
                ? "border-[#002B5E] bg-blue-50 text-[#002B5E]"
                : "border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <Clock size={22} className={duration === d.hours ? "text-[#002B5E]" : "text-slate-400"} />
            <span className="font-bold text-base">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CreateAuctionModal({ myCollection, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [duration, setDuration] = useState(24);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  function addRequirement(sticker) {
    setRequirements(prev => [...prev, { sticker, quantity: 1 }]);
  }

  function removeRequirement(number) {
    setRequirements(prev => prev.filter(r => r.sticker.number !== number));
  }

  function changeQty(number, delta) {
    setRequirements(prev =>
      prev.map(r =>
        r.sticker.number === number
          ? { ...r, quantity: Math.max(1, r.quantity + delta) }
          : r
      )
    );
  }

  function handleSubmit() {
    onSubmit({ sticker: selectedSticker, requirements, durationHours: duration });
    onClose();
  }

  const canNext = step === 1 ? !!selectedSticker : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white flex flex-col overflow-hidden w-full h-full md:h-[85vh] md:max-h-[750px] md:w-[600px] md:max-w-[95vw] md:rounded-xl shadow-2xl">

        <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">Publicar subasta</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Paso {step} de 3 · {STEP_LABELS[step - 1]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex gap-1.5 px-4 pt-3 pb-1 shrink-0">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-[#002B5E]" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          {step === 1 && (
            <StepSticker
              myCollection={myCollection}
              selected={selectedSticker}
              onSelect={setSelectedSticker}
            />
          )}
          {step === 2 && (
            <StepRequirements
              catalog={myCollection}
              requirements={requirements}
              onAdd={addRequirement}
              onRemove={removeRequirement}
              onChangeQty={changeQty}
            />
          )}
          {step === 3 && (
            <StepDuration duration={duration} onSelect={setDuration} />
          )}
        </div>

        <div className="shrink-0 p-4 md:p-6 border-t border-slate-100 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Atrás
            </button>
          )}
          <button
            disabled={!canNext}
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
            className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-[#002B5E] hover:bg-[#003a7a] text-white shadow-lg shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {step < 3 ? "Siguiente" : "Publicar subasta"}
          </button>
        </div>
      </div>
    </div>
  );
}
