"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import StickerFace from "@/components/sticker/StickerFace";
import StickerModal from "@/components/sticker/StickerModal";
import { useAuth } from "@/hooks/useAuth";
import { useRemoveMissingStickerMutation } from "@/store/api/collectionApi";
import type { MockCollectionItem, MockSticker } from "@/data/types";

interface StickerCardProps {
  item?: MockCollectionItem;
  sticker?: MockSticker;
  missing?: boolean;
  /** Habilita editar cantidad / eliminar (solo en la colección propia). */
  editable?: boolean;
}

// item prop → modo interactivo (click abre modal, quantity badge, hover)
// sticker prop → modo estático (solo visual, sin interacción)
export default function StickerCard({
  item,
  sticker: stickerProp,
  missing = false,
  editable = false,
}: StickerCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [removeMissing, { isLoading: isRemovingMissing }] = useRemoveMissingStickerMutation();

  const sticker = item?.sticker ?? stickerProp;
  const isInteractive = !!item && !missing;

  if (!sticker) return null;

  async function handleRemoveMissing(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user?.id || !sticker) return;
    try {
      await removeMissing({ userId: user.id, stickerNumber: sticker.number }).unwrap();
    } catch {
      alert("No se pudo eliminar la figurita faltante.");
    }
  }

  return (
    <>
      <div
        className={`group relative w-full aspect-[4/5] bg-white p-[6px] border border-slate-200 transition-all duration-300
          ${isInteractive ? "shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
          ${missing ? "grayscale opacity-60" : ""}
        `}
        onClick={isInteractive ? () => setShowModal(true) : undefined}
      >
        {isInteractive && item && <QuantityBadge quantity={item.quantity} />}
        {editable && missing && (
          <button
            onClick={handleRemoveMissing}
            disabled={isRemovingMissing}
            className="absolute top-1 right-1 z-10 p-1 rounded-full bg-white/90 text-[#BF0A30] shadow hover:bg-white transition-colors disabled:opacity-40"
            title="Eliminar faltante"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
        <StickerFace
          sticker={sticker}
          imageClassName={
            isInteractive ? "transition-transform duration-300 group-hover:scale-105" : ""
          }
        />
      </div>

      {showModal && item && (
        <StickerModal item={item} onClose={() => setShowModal(false)} editable={editable} />
      )}
    </>
  );
}
