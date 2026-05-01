import React from "react";

export default function OwnerBadge({ name }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-[#002B5E] flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-white">{initials}</span>
      </div>
      <span className="text-sm text-slate-600 font-medium truncate">{name}</span>
    </div>
  );
}
