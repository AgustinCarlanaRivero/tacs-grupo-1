"use client";

import React, { type ReactNode } from "react";
import { X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ModalShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  wide?: boolean;
}

export default function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: ModalShellProps) {
  useScrollLock();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white flex flex-col overflow-hidden w-full h-full md:rounded-xl shadow-2xl md:max-w-[95vw] ${
          wide
            ? "md:h-[80vh] md:max-h-[800px] md:w-[900px]"
            : "md:h-[85vh] md:max-h-[750px] md:w-[600px]"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
