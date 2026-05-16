import React, { type ReactNode } from "react";

export interface PageTab<K extends string = string> {
  key: K;
  label: ReactNode;
  badge?: ReactNode;
}

interface PageTabsProps<K extends string = string> {
  tabs: PageTab<K>[];
  active: K;
  onChange: (key: K) => void;
}

export default function PageTabs<K extends string = string>({
  tabs,
  active,
  onChange,
}: PageTabsProps<K>) {
  return (
    <div className="flex gap-1 mb-6 border-b border-slate-200">
      {tabs.map(({ key, label, badge }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            active === key ? "text-[#002B5E]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {label}
          {badge && (
            <span className="bg-[#BF0A30] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {badge}
            </span>
          )}
          {active === key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#002B5E] rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
