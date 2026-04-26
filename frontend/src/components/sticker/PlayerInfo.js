import React from "react";

export default function PlayerInfo({ player, variant = "regular" }) {
  const isShiny = variant === "shiny";
  const country = player.nationalTeam?.name || "COUNTRY";
  const club = player.club?.name || "CLUB";

  if (isShiny) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-3 px-3">
        <h3 className="text-base font-black text-yellow-300 uppercase tracking-[0.12em] leading-tight break-words mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {player.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-200/90">{country}</span>
          <span className="text-yellow-400/40 text-[11px]">•</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-yellow-100/60">{club}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[3] flex flex-col justify-between bg-white">
      {/* Country & Club */}
      <div className="flex justify-between items-center px-3 pt-2 pb-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[48%]">{country}</span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[48%] text-right">{club}</span>
      </div>

      {/* Divider */}
      <div className="w-[85%] mx-auto h-px bg-slate-200"></div>

      {/* Player name */}
      <div className="flex-1 flex items-center justify-center px-2 pb-1">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.12em] text-center leading-tight break-words">
          {player.name}
        </h3>
      </div>
    </div>
  );
}
