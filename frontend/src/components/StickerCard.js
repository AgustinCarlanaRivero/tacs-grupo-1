import React from "react";

export default function StickerCard({ item }) {
  const { sticker, quantity } = item;
  const isShiny = sticker.category === "SHINY";
  
  // Determine flag and abbreviation based on National Team
  let flag = "🏳️";
  let abbr = "UNK";
  if (sticker.player.nationalTeam?.name === "USA") {
    flag = "🇺🇸";
    abbr = "USA";
  } else if (sticker.player.nationalTeam?.name === "Mexico") {
    flag = "🇲🇽";
    abbr = "MEX";
  } else if (sticker.player.nationalTeam?.name === "Canada") {
    flag = "🇨🇦";
    abbr = "CAN";
  }

  return (
    <div className="group relative w-full aspect-[4/5] bg-white p-2.5 sm:p-3 shadow-md border border-slate-200 rounded-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
      
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
            src="/placeholder.png" 
            alt="Player Portrait" 
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.05] z-0"
          />
        </div>

        {/* Bottom Area (30%): Info Section */}
        <div className="bg-white border-t-4 border-slate-200 flex flex-col justify-center px-3 py-2 z-10 shrink-0 h-[30%]">
          {/* Country & Club */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg leading-none filter drop-shadow-sm">{flag}</span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{abbr}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[50%] text-right">
              {sticker.player.club?.name || "CLUB"}
            </span>
          </div>
          
          {/* Player Name */}
          <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-widest truncate w-full text-center mt-1">
            {sticker.player.name}
          </h3>
        </div>
      </div>
    </div>
  );
}
