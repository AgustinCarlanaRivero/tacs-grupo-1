"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  variant = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = variant === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-sm"
    >
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          isSuccess
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
        role="status"
      >
        <Icon size={18} className={isSuccess ? "text-green-600" : "text-[#BF0A30]"} />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5 transition-colors">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
