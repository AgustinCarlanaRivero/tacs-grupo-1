import React from "react";

export default function PageTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-slate-200">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
            active === key ? "text-[#002B5E]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {label}
          {active === key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#002B5E] rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
