"use client";

import React, { useState } from "react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import StickerFace from "@/components/sticker/StickerFace";
import StickerModal from "@/components/sticker/StickerModal";

const CARD_BASE = "group relative w-full aspect-[4/5] bg-white p-[6px] shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer";

export default function StickerCard({ item }) {
  const [showModal, setShowModal] = useState(false);
  const { sticker, quantity } = item;

  return (
    <>
      <div className={CARD_BASE} onClick={() => setShowModal(true)}>
        <QuantityBadge quantity={quantity} />
        <StickerFace 
          sticker={sticker} 
          imageClassName="transition-transform duration-300 group-hover:scale-105" 
        />
      </div>

      {showModal && (
        <StickerModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
