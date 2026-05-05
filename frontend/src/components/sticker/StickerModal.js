"use client";

import React from "react";
import StickerFace from "@/components/sticker/StickerFace";
import { useMouseTilt } from "@/hooks/useMouseTilt";

export default function StickerModal({ item, onClose }) {
  const { ref, transform, glare, onMouseMove, onMouseLeave } = useMouseTilt();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative" onClick={e => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
