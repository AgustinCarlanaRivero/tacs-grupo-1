"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import RequireAuth from "@/components/layout/RequireAuth";
import { useGetCollectionQuery } from "@/store/api/collectionApi";
import { useGetUserAuctionsQuery, useGetUserDirectTradesQuery } from "@/store/api/postApi";
import { useGetRatingsByUserQuery } from "@/store/api/ratingApi";
import { useGetOffersByUserQuery } from "@/store/api/offerApi";
import StickerRow from "@/components/common/StickerRow";
import OfferStateBadge from "@/components/offer/OfferStateBadge";
import EmptyState from "@/components/common/EmptyState";
import {
  Camera,
  Gavel,
  ArrowLeftRight,
  Star,
  Package,
  BookmarkX,
  Copy,
  ChevronRight,
} from "lucide-react";

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
      {icon}
      <span className="text-2xl font-extrabold text-slate-800">{value}</span>
      <span className="text-xs text-slate-500 font-medium text-center">{label}</span>
    </div>
  );
}

interface ActivityCardProps {
  icon: ReactNode;
  count: ReactNode;
  label: ReactNode;
  href: string;
}

function ActivityCard({ icon, count, label, href }: ActivityCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-[#002B5E]/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <span className="text-xl font-extrabold text-slate-800">{count}</span>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </Link>
  );
}

function PerfilContent() {
  const { user } = useAuth();
  const [customAvatar, setCustomAvatar] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("profile_avatar") : null
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", { skip: !user?.id });
  const { data: myAuctions = [] } = useGetUserAuctionsQuery(user?.id ?? "", { skip: !user?.id });
  const { data: myTrades = [] } = useGetUserDirectTradesQuery(user?.id ?? "", { skip: !user?.id });
  const { data: ratings = [] } = useGetRatingsByUserQuery(user?.id ?? "", { skip: !user?.id });
  const { data: sentOffers = [] } = useGetOffersByUserQuery(
    { userId: user?.id ?? "", role: "sent" },
    { skip: !user?.id }
  );

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result;
      if (typeof base64 === "string") {
        setCustomAvatar(base64);
        localStorage.setItem("profile_avatar", base64);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const ownedItems = collectionData?.items ?? [];
  const totalOwned = ownedItems.reduce((acc, s) => acc + s.quantity, 0);
  const totalMissing = collectionData?.missingStickers?.length ?? 0;
  const totalDuplicates = ownedItems.reduce((acc, s) => acc + Math.max(0, s.quantity - 1), 0);

  const activeAuctions = myAuctions.filter((a) => a.state === "ACTIVE");
  const activeTrades = myTrades.filter((t) => t.state === "ACTIVE");

  const avgReputation =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : null;

  const avatarSrc = customAvatar || user?.picture;

  return (
    <main className="container mx-auto px-4 pb-24 max-w-2xl">
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="relative">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-[#002B5E] text-white rounded-full p-2 shadow-md hover:bg-[#003d85] transition-colors disabled:opacity-60"
            title="Cambiar foto de perfil"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-800">{user?.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-slate-600">
              {avgReputation !== null
                ? `Reputación: ${avgReputation} (${ratings.length} valoracion${ratings.length !== 1 ? "es" : ""})`
                : "Sin valoraciones aún"}
            </span>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Cambiar foto de perfil
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Mi Colección
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Package size={18} className="text-[#002B5E]" />}
            value={totalOwned}
            label="Tengo"
          />
          <StatCard
            icon={<BookmarkX size={18} className="text-[#BF0A30]" />}
            value={totalMissing}
            label="Me faltan"
          />
          <StatCard
            icon={<Copy size={18} className="text-slate-400" />}
            value={totalDuplicates}
            label="Repetidas"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Actividad
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ActivityCard
            icon={<Gavel size={18} className="text-[#002B5E]" />}
            count={activeAuctions.length}
            label="Subastas activas"
            href="/auctions"
          />
          <ActivityCard
            icon={<ArrowLeftRight size={18} className="text-[#002B5E]" />}
            count={activeTrades.length}
            label="Intercambios activos"
            href="/trades"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Mis ofertas enviadas
        </h3>
        {sentOffers.length === 0 ? (
          <EmptyState message="Todavía no enviaste ofertas." />
        ) : (
          <div className="flex flex-col gap-3">
            {sentOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {new Date(offer.createdAt).toLocaleDateString("es-AR")}
                  </span>
                  <OfferStateBadge state={offer.state} />
                </div>
                <div className="flex flex-col gap-1.5">
                  {offer.offered.map(({ sticker, quantity }) => (
                    <StickerRow key={sticker.number} sticker={sticker} quantity={quantity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PerfilPage() {
  return (
    <RequireAuth>
      <PerfilContent />
    </RequireAuth>
  );
}
