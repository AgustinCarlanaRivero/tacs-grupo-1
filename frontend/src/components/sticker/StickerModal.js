"use client";

import React, { useState, useRef, useCallback } from "react";

export default function StickerModal({ item, onClose }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  const { sticker } = item;
  const isShiny = sticker.category === "SHINY";
  const country = sticker.player.nationalTeam?.name || "COUNTRY";
  const club = sticker.player.club?.name || "CLUB";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium transition-colors"
        >
          Cerrar ✕
        </button>

        {/* 3D Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-[300px] sm:w-[340px] aspect-[4/5] bg-white p-[6px] shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ transform, transition: "transform 0.15s ease-out" }}
        >
          {/* Glare overlay */}
          <div
            className="absolute inset-0 z-30 pointer-events-none rounded-sm"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 60%)`,
              transition: "opacity 0.15s ease-out",
            }}
          />

          {/* Card content */}
          {isShiny ? (
            <div className="relative w-full h-full overflow-hidden ring-1 ring-yellow-400/50">
              <img
                src={sticker.player.image || "/placeholder.png"}
                alt={sticker.player.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Shiny overlays */}
              <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-700/20"></div>
              <div
                className="absolute inset-0 z-[2] pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,220,0.9) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}
              ></div>
              <div
                className="absolute inset-0 z-[3] pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)',
                  animation: 'shineSweep 3s ease-in-out infinite',
                }}
              ></div>
              {/* Shiny info */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-14 pb-4 px-4">
                <h3 className="text-xl font-black text-yellow-300 uppercase tracking-[0.12em] leading-tight break-words mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {sticker.player.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-yellow-200/90">{country}</span>
                  <span className="text-yellow-400/40">•</span>
                  <span className="text-sm font-medium uppercase tracking-wider text-yellow-100/60">{club}</span>
                </div>
              </div>
              {/* Number */}
              <div className="absolute top-3 left-3 z-20">
                <div className="bg-yellow-400/90 text-yellow-950 font-black text-sm px-2.5 py-1 shadow-md backdrop-blur-sm">
                  #{sticker.number}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden flex flex-col">
              <div className="bg-[#002B5E] flex items-center justify-between px-3 py-1.5 shrink-0">
                <span className="text-white font-black text-sm tracking-wider">#{sticker.number}</span>
                <span className="text-blue-200 font-bold text-[10px] uppercase tracking-widest">{country}</span>
              </div>
              <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-[#002B5E] to-[#001a3a]">
                <img
                  src={sticker.player.image || "/placeholder.png"}
                  alt={sticker.player.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
              <div className="bg-[#003a7a] px-3 py-2.5 shrink-0">
                <h3 className="text-base font-black text-white uppercase tracking-[0.1em] leading-tight break-words text-center">
                  {sticker.player.name}
                </h3>
              </div>
              <div className="bg-[#002B5E] px-3 py-1.5 shrink-0 flex items-center justify-center">
                <span className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">{club}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
