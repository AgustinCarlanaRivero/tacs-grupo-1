import React from "react";
import type { OfferState } from "@/store/api/offerApi";

const STATE_STYLES: Record<OfferState, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-500" },
  CANCELLED: { label: "Cancelada", className: "bg-slate-100 text-slate-500" },
};

export default function OfferStateBadge({ state }: { state: OfferState }) {
  const { label, className } = STATE_STYLES[state] ?? STATE_STYLES.PENDING;
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}
