"use client";

import React, { useState } from "react";
import QuantityBadge from "@/components/sticker/QuantityBadge";
import StickerFace from "@/components/sticker/StickerFace";
import StickerModal from "@/components/sticker/StickerModal";

const CARD_BASE = "group relative w-full aspect-[4/5] bg-white p-[6px] shadow-md border border-slate-200 transition-all duration-300";
const CARD_ACTIVE = "hover:shadow-xl hover:-translate-y-1 cursor-pointer";
const CARD_MISSING = "grayscale opacity-60";

export default function StickerCard({ item, missing = false }) {
  const [showModal, setShowModal] = useState(false);
  const { sticker, quantity } = item;

  return (
    <>
      <div
        className={`${CARD_BASE} ${missing ? CARD_MISSING : CARD_ACTIVE}`}
        onClick={missing ? undefined : () => setShowModal(true)}
      >
        {!missing && <QuantityBadge quantity={quantity} />}
        <StickerFace
          sticker={sticker}
          imageClassName={missing ? "" : "transition-transform duration-300 group-hover:scale-105"}
        />
      </div>

      {showModal && !missing && (
        <StickerModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
