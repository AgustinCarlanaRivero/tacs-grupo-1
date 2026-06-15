"use client";

import React, { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import StickerFace from "@/components/sticker/StickerFace";
import { useMouseTilt } from "@/hooks/useMouseTilt";
import { useAuth } from "@/hooks/useAuth";
import {
  useRemoveCollectionItemMutation,
  useUpdateCollectionItemQuantityMutation,
} from "@/store/api/collectionApi";
import type { MockCollectionItem } from "@/data/types";

interface StickerModalProps {
  item: MockCollectionItem;
  onClose: () => void;
  /** Habilita editar cantidad / eliminar (solo en la colección propia). */
  editable?: boolean;
}

export default function StickerModal({ item, onClose, editable = false }: StickerModalProps) {
  const { ref, transform, glare, onMouseMove, onMouseLeave } = useMouseTilt();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(item.quantity);
  const [updateQuantity, { isLoading: isUpdating }] = useUpdateCollectionItemQuantityMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveCollectionItemMutation();
  const busy = isUpdating || isRemoving;

  async function changeQuantity(next: number) {
    if (!user?.id || next < 1) return;
    const prev = quantity;
    setQuantity(next);
    try {
      await updateQuantity({
        userId: user.id,
        stickerNumber: item.sticker.number,
        quantity: next,
      }).unwrap();
    } catch {
      setQuantity(prev);
      alert("No se pudo actualizar la cantidad.");
    }
  }

  async function remove() {
    if (!user?.id) return;
    try {
      await removeItem({ userId: user.id, stickerNumber: item.sticker.number }).unwrap();
      onClose();
    } catch {
      alert("No se pudo eliminar la figurita.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium transition-colors"
        >
          Cerrar ✕
        </button>

        <div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="relative w-[300px] sm:w-[340px] aspect-[4/5] bg-white p-[6px] shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ transform, transition: "transform 0.15s ease-out" }}
        >
          <div
            className="absolute inset-0 z-30 pointer-events-none rounded-sm"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
              transition: "opacity 0.15s ease-out",
            }}
          />
          <StickerFace sticker={item.sticker} />
        </div>

        {editable && (
          <div
            className="mt-4 flex items-center justify-between gap-3 bg-white rounded-xl p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeQuantity(quantity - 1)}
                disabled={busy || quantity <= 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                aria-label="Restar una"
              >
                <Minus size={16} className="text-slate-700" />
              </button>
              <span className="w-8 text-center font-extrabold text-slate-800">{quantity}</span>
              <button
                onClick={() => changeQuantity(quantity + 1)}
                disabled={busy}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                aria-label="Sumar una"
              >
                <Plus size={16} className="text-slate-700" />
              </button>
            </div>
            <button
              onClick={remove}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#BF0A30] bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
