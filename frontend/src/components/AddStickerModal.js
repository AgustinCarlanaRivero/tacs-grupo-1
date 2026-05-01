"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Modal reutilizable para agregar figuritas.
 * Se usa tanto para agregar a "Mi Colección" como para agregar a "Faltantes".
 *
 * Props:
 *  - title: título del modal (ej: "Agregar figurita" o "Agregar figurita faltante")
 *  - onClose: cerrar el modal
 *  - onSubmit: callback con los datos del formulario
 */
export default function AddStickerModal({ title, onClose, onSubmit }) {
  const [number, setNumber] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [nationalTeam, setNationalTeam] = useState("");
  const [club, setClub] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("REGULAR");
  const [quantity, setQuantity] = useState(1);

  function handleSubmit(e) {
    e.preventDefault();
    if (!number || !playerName) return;

    onSubmit({
      sticker: {
        number: parseInt(number, 10),
        player: {
          name: playerName,
          nationalTeam: nationalTeam ? { name: nationalTeam } : null,
          club: club ? { name: club } : null,
          image: imageUrl || null,
        },
        category,
      },
      quantity,
    });

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Número */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Número de figurita <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ej: 10"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
            />
          </div>

          {/* Nombre del jugador */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Nombre del jugador <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Lionel Messi"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
            />
          </div>

          {/* Selección y Club en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Selección</label>
              <input
                type="text"
                value={nationalTeam}
                onChange={(e) => setNationalTeam(e.target.value)}
                placeholder="Ej: Argentina"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Club</label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ej: Inter Miami"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
              />
            </div>
          </div>

          {/* URL imagen */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">URL de imagen</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
            />
          </div>

          {/* Categoría y Cantidad en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
              >
                <option value="REGULAR">Regular</option>
                <option value="SHINY">Shiny ✦</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all bg-slate-50"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full py-2.5 mt-2 bg-[#002B5E] hover:bg-[#003a7a] text-white font-bold text-sm uppercase tracking-wide"
          >
            Agregar figurita
          </Button>
        </form>
      </div>
    </div>
  );
}
