"use client";

import React, { useState, useEffect } from "react";
import StickerFace from "@/components/sticker/StickerFace";
import { Clock, AlertCircle } from "lucide-react";

function useCountdown(endsAt) {
  const [timeLeft, setTimeLeft] = useState(endsAt.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endsAt.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  return timeLeft;
}

function formatTime(ms) {
  if (ms <= 0) return "Finalizada";

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function AuctionCard({ auction, onSelect }) {
  const { sticker, owner, endsAt, minimumRequirements } = auction;
  const initials = owner.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isShiny = sticker.category === "SHINY";

  const timeLeftMs = useCountdown(endsAt);
  const isEnded = timeLeftMs <= 0;

  return (
    <div className={`flex flex-col md:flex-row bg-white border ${isEnded ? 'border-red-200 opacity-80' : 'border-slate-200'}`}>

      {/* Main Sticker Preview */}
      <div className="p-3 flex items-center justify-center">
        <div className="w-48 p-2 border aspect-[4/5] flex items-center justify-center">
          <StickerFace sticker={sticker} />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">

        {/* Info Box */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-2xl">{sticker.player.name}</h3>
            {isShiny && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                Shiny
              </span>
            )}
          </div>
          <p className="text-md text-slate-500 mb-4">
            {sticker.player.nationalTeam?.name} · {sticker.player.club?.name}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#002B5E] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{initials}</span>
            </div>
            <span className="text-md text-slate-600 font-medium">{owner.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className={isEnded ? 'text-red-500' : 'text-slate-400'} />
            <span className={`text-md font-bold ${isEnded ? 'text-red-600' : 'text-slate-700'}`}>
              {formatTime(timeLeftMs)}
            </span>
          </div>
        </div>

        {/* Requirements */}
        <div className="p-4 flex flex-col md:min-w-[300px]">
          <p className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-blue-500" /> Requisitos
          </p>
          
          {minimumRequirements?.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {minimumRequirements.map(req => (
                <div key={req.sticker.number} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded border border-slate-200 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-500">#{req.sticker.number}</span>
                    <span className="font-medium text-slate-700 truncate">{req.sticker.player.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      req.sticker.category === "SHINY" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {req.sticker.category === "SHINY" ? "Shiny" : "Regular"}
                    </span>
                    <span className="font-black bg-[#002B5E] text-white px-2 py-0.5 rounded">x{req.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-4">Sin requisitos</p>
          )}

          <div className="mt-auto pt-2">
            <button
              disabled={isEnded}
              onClick={() => onSelect(auction)}
              className={`w-full py-3 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                isEnded 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#002B5E] hover:bg-[#003a7a] text-white'
              }`}
            >
              {isEnded ? 'Cerrada' : 'Pujar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
