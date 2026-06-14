"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import StickerCard from "@/components/sticker/StickerCard";
import EmptyState from "@/components/common/EmptyState";
import OwnerBadge from "@/components/common/OwnerBadge";
import StickerRow from "@/components/common/StickerRow";
import RatingForm from "@/components/rating/RatingForm";
import OfferStateBadge from "@/components/offer/OfferStateBadge";
import type { DirectTradePostDTO } from "@/lib/schemas/postSchema";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetOffersByPostQuery,
  useUpdateOfferStateMutation,
  type OfferDTO,
} from "@/store/api/offerApi";

interface OfferItemProps {
  offer: OfferDTO;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating: boolean;
  canRate: boolean;
}

function OfferItem({ offer, onApprove, onReject, isUpdating, canRate }: OfferItemProps) {
  const isPending = offer.state === "PENDING";
  const isApproved = offer.state === "APPROVED";
  const [showRating, setShowRating] = useState(false);
  return (
    <div className="p-4 border border-slate-100 rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <OwnerBadge name={offer.offerer.username} />
        <OfferStateBadge state={offer.state} />
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
            disabled={isUpdating}
            className="flex-1 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-40"
          >
            Aceptar
          </button>
          <button
            onClick={() => onReject(offer.id)}
            disabled={isUpdating}
            className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-40"
          >
            Rechazar
          </button>
        </div>
      )}
      {isApproved && canRate && !showRating && (
        <button
          onClick={() => setShowRating(true)}
          className="py-1.5 text-xs font-bold text-[#002B5E] bg-slate-50 hover:bg-slate-100 rounded transition-colors"
        >
          Calificar a {offer.offerer.username}
        </button>
      )}
      {isApproved && canRate && showRating && (
        <RatingForm
          revieweeId={offer.offerer.id}
          revieweeName={offer.offerer.username}
        />
      )}
    </div>
  );
}

interface TradeOffersModalProps {
  trade: DirectTradePostDTO;
  onClose: () => void;
  onCancelTrade?: () => void;
}

export default function TradeOffersModal({ trade, onClose, onCancelTrade }: TradeOffersModalProps) {
  const { user } = useAuth();
  const { data: offers = [], isLoading } = useGetOffersByPostQuery(
    { userId: trade.owner.id, postId: trade.id },
    { skip: !trade.id }
  );
  const [updateOfferState, { isLoading: isUpdating }] = useUpdateOfferStateMutation();

  async function approve(offerId: string) {
    if (!user?.id) return;
    try {
      await updateOfferState({
        userId: trade.owner.id,
        postId: trade.id,
        offerId,
        state: "APPROVED",
      }).unwrap();
    } catch {
      alert("No se pudo aceptar la oferta.");
    }
  }

  async function reject(offerId: string) {
    if (!user?.id) return;
    try {
      await updateOfferState({
        userId: trade.owner.id,
        postId: trade.id,
        offerId,
        state: "REJECTED",
      }).unwrap();
    } catch {
      alert("No se pudo rechazar la oferta.");
    }
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

        {onCancelTrade && (
          <div className="px-5 pt-3">
            <button
              onClick={onCancelTrade}
              className="w-full py-2 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              Cancelar intercambio
            </button>
          </div>
        )}

        <h3 className="font-bold text-slate-800 px-5 pt-4">Ofertas</h3>
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : offers.length === 0 ? (
            <EmptyState message="Todavía no recibiste ofertas para este intercambio." />
          ) : (
            offers.map((offer) => (
              <OfferItem
                key={offer.id}
                offer={offer}
                onApprove={approve}
                onReject={reject}
                isUpdating={isUpdating}
                canRate={!!user?.id && user.id !== offer.offerer.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
