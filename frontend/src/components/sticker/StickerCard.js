"use client";

import React, { useState } from "react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import StickerFace from "@/components/sticker/StickerFace";
import StickerModal from "@/components/sticker/StickerModal";

// item prop → modo interactivo (click abre modal, quantity badge, hover)
// sticker prop → modo estático (solo visual, sin interacción)
export default function StickerCard({ item, sticker: stickerProp, missing = false }) {
  const [showModal, setShowModal] = useState(false);

  const sticker = item?.sticker ?? stickerProp;
  const isInteractive = !!item && !missing;

  return (
    <>
      <div
        className={`group relative w-full aspect-[4/5] bg-white p-[6px] border border-slate-200 transition-all duration-300
          ${isInteractive ? "shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer" : ""}
          ${missing ? "grayscale opacity-60" : ""}
        `}
        onClick={isInteractive ? () => setShowModal(true) : undefined}
      >
        {isInteractive && <QuantityBadge quantity={item.quantity} />}
        <StickerFace
          sticker={sticker}
          imageClassName={isInteractive ? "transition-transform duration-300 group-hover:scale-105" : ""}
        />
      </div>

      {showModal && (
        <StickerModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
