"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/data/types";

export interface AddStickerSubmit {
  sticker: {
    number: number;
    player: {
      name: string;
      nationalTeam: { name: string } | null;
      club: { name: string } | null;
      image: string | null;
    };
    category: Category;
  };
  quantity: number;
}

interface AddStickerModalProps {
  title: ReactNode;
  onClose: () => void;
  onSubmit: (item: AddStickerSubmit) => void;
}

export default function AddStickerModal({ title, onClose, onSubmit }: AddStickerModalProps) {
  const [number, setNumber] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [nationalTeam, setNationalTeam] = useState<string>("");
  const [club, setClub] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [category, setCategory] = useState<Category>("REGULAR");
  const [quantity, setQuantity] = useState<number>(1);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <FormField label="Número de figurita" required>
            <input
              type="number"
              min="1"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ej: 10"
              required
              className="form-input"
            />
          </FormField>

          <FormField label="Nombre del jugador" required>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Lionel Messi"
              required
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Selección">
              <input
                type="text"
                value={nationalTeam}
                onChange={(e) => setNationalTeam(e.target.value)}
                placeholder="Ej: Argentina"
                className="form-input"
              />
            </FormField>
            <FormField label="Club">
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ej: Inter Miami"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="URL de imagen">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="form-input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Categoría">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="form-input"
              >
                <option value="REGULAR">Regular</option>
                <option value="SHINY">Shiny ✦</option>
              </select>
            </FormField>
            <FormField label="Cantidad">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="form-input"
              />
            </FormField>
          </div>

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

interface FormFieldProps {
  label: ReactNode;
  required?: boolean;
  children: ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
