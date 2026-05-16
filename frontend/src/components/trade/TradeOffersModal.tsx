"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import StickerCard from "@/components/sticker/StickerCard";
import EmptyState from "@/components/common/EmptyState";
import OwnerBadge from "@/components/common/OwnerBadge";
import StickerRow from "@/components/common/StickerRow";
import type { MockOffer, MockTrade } from "@/data/types";

type OfferState = MockOffer["state"] | "APPROVED" | "CANCELLED";

interface MutableOffer extends Omit<MockOffer, "state"> {
  state: OfferState;
}

const STATE_STYLES: Record<OfferState, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
  APPROVED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-500" },
  CANCELLED: { label: "Cancelada", className: "bg-slate-100 text-slate-500" },
};

function StatusBadge({ state }: { state: OfferState }) {
  const { label, className } = STATE_STYLES[state] ?? STATE_STYLES.PENDING;
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}

interface OfferItemProps {
  offer: MutableOffer;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function OfferItem({ offer, onApprove, onReject }: OfferItemProps) {
  const isPending = offer.state === "PENDING";
  return (
    <div className="p-4 border border-slate-100 rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <OwnerBadge name={offer.offerer.name} />
        <StatusBadge state={offer.state} />
      </div>
      <div className="flex flex-col gap-1.5">
        {offer.offered.map(({ sticker, quantity }) => (
          <StickerRow key={sticker.number} sticker={sticker} quantity={quantity} />
        ))}
      </div>
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(offer.id)}
            className="flex-1 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
          >
            Aceptar
          </button>
          <button
            onClick={() => onReject(offer.id)}
            className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

interface TradeOffersModalProps {
  trade: MockTrade;
  offers: MockOffer[];
  onClose: () => void;
  onCancelTrade?: () => void;
}

export default function TradeOffersModal({
  trade,
  offers: initialOffers,
  onClose,
}: TradeOffersModalProps) {
  const [offers, setOffers] = useState<MutableOffer[]>(initialOffers);

  function approve(offerId: string) {
    setOffers((prev) =>
      prev.map((o) => ({
        ...o,
        state:
          o.id === offerId
            ? "APPROVED"
            : o.state === "PENDING"
              ? "REJECTED"
              : o.state,
      }))
    );
  }

  function reject(offerId: string) {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, state: "REJECTED" } : o))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <StickerCard sticker={trade.sticker} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ofertas recibidas</h3>
              <p className="text-sm text-slate-500 mt-0.5">{trade.sticker.player.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <h3 className="font-bold text-slate-800 px-5 pt-4">Ofertas</h3>
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {offers.length === 0 ? (
            <EmptyState message="Todavía no recibiste ofertas para este intercambio." />
          ) : (
            offers.map((offer) => (
              <OfferItem
                key={offer.id}
                offer={offer}
                onApprove={approve}
                onReject={reject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
