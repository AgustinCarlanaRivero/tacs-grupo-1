import React from "react";

export default function NumberBadge({ number, variant = "regular" }) {
  const isShiny = variant === "shiny";

  return (
    <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1">
      <div className={`font-black text-sm px-2 py-0.5 shadow-md backdrop-blur-sm ${isShiny ? 'bg-yellow-400/90 text-yellow-950' : 'bg-white/90 text-slate-800'}`}>
        #{number}
      </div>
      {isShiny && (
        <div className="bg-white/85 backdrop-blur-sm text-yellow-700 font-bold text-[9px] uppercase tracking-widest px-1.5 py-0.5 shadow-sm animate-pulse">
          Shiny
        </div>
      )}
    </div>
  );
}
