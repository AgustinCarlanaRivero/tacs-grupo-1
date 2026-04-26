import React from "react";

export default function StickerCard({ item }) {
  const { sticker, quantity } = item;
  const isShiny = sticker.category === "SHINY";

  return (
    <div className="group relative w-full aspect-[4/5] bg-white p-2.5 sm:p-3 shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
      
      {/* Badge (only show if we have duplicates or none) */}
      {quantity !== 1 && (
        <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md z-20 transition-transform group-hover:scale-110 ${quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
          {quantity}
        </div>
      )}

      {/* Inner Sticker Content */}
      <div className={`relative w-full h-full overflow-hidden flex flex-col rounded-sm border border-slate-300/50 ${isShiny ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`}>
        
        {/* Shiny Effect Overlay */}
        {isShiny && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10 pointer-events-none"></div>
        )}

        {/* Top Area (70%): Photo & Background */}
        <div className="relative flex-1 w-full overflow-hidden">
          {/* Top Left: Number */}
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
            <div className="bg-white text-slate-800 font-black text-sm px-2 py-0.5 rounded shadow-sm border border-slate-200">
              #{sticker.number}
            </div>
            {isShiny && (
              <div className="bg-yellow-400 text-yellow-900 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                Shiny
              </div>
            )}
          </div>

          <img 
            src={sticker.player.image || "/placeholder.png"} 
            alt="Player Portrait" 
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.05] z-0"
          />
        </div>

        {/* Bottom Area (30%): Info Section */}
        <div className="bg-white flex flex-col justify-end z-10 shrink-0 h-[30%] border-t border-slate-200">
          
          {/* Country & Club Bar */}
          <div className="flex-1 flex justify-between items-center px-3 bg-slate-50">
            <div className="flex flex-col items-start w-[48%]">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">País</span>
              <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 tracking-wider uppercase truncate w-full">
                {sticker.player.nationalTeam?.name || "COUNTRY"}
              </span>
            </div>
            
            <div className="h-full w-px bg-slate-200"></div>
            
            <div className="flex flex-col items-end w-[48%]">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Club</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase truncate w-full text-right">
                {sticker.player.club?.name || "CLUB"}
              </span>
            </div>
          </div>

          {/* Player Name Banner */}
          <div className="w-full py-2 px-2 flex items-center justify-center border-t border-slate-200 bg-slate-50 min-h-[44px]">
            <h3 className="text-sm sm:text-sm font-black text-slate-700 uppercase tracking-[0.2em] text-center leading-none break-words">
              {sticker.player.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
