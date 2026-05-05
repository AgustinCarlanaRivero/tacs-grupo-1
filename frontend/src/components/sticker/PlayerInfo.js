import React from "react";

const STYLES = {
  shiny: {
    name: "text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]",
    country: "text-yellow-200/90",
    dot: "text-yellow-400/40",
    club: "text-yellow-100/60",
  },
  regular: {
    name: "text-slate-800",
    country: "text-slate-500",
    dot: "text-slate-300",
    club: "text-slate-400",
  },
};

function InfoContent({ player, variant }) {
  const s = STYLES[variant] || STYLES.regular;
  const country = player.nationalTeam?.name || "COUNTRY";
  const club = player.club?.name || "CLUB";

  return (
    <>
      <h3 className={`text-sm font-black uppercase tracking-[0.12em] leading-tight break-words mb-1.5 ${s.name}`}>
        {player.name}
      </h3>
      <div className={`w-full h-px mb-1.5 ${variant === "shiny" ? "bg-white/20" : "bg-slate-200"}`}></div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${s.country}`}>{country}</span>
        <span className={`text-[11px] ${s.dot}`}>•</span>
        <span className={`text-[11px] font-medium uppercase tracking-wider ${s.club}`}>{club}</span>
      </div>
    </>
  );
}

// Overlay mode: absolute positioned over the image (for shiny)
export function PlayerInfoOverlay({ player, variant = "shiny" }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-3 px-3">
      <InfoContent player={player} variant={variant} />
    </div>
  );
}

// Panel mode: static bottom section (for regular)
export function PlayerInfoPanel({ player, variant = "regular" }) {
  return (
    <div className="flex-[3] flex flex-col justify-center bg-white px-3 py-2">
      <InfoContent player={player} variant={variant} />
    </div>
  );
}
