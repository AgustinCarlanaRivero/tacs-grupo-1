"use client";

import React from "react";
import { Search } from "lucide-react";

export default function StickerSearchInput({ value, onChange, placeholder = "Buscar por jugador, selección o club..." }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all rounded-md"
      />
    </div>
  );
}
