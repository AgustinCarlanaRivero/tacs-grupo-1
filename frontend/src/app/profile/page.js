"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockStickers, mockMissingStickers } from "@/data/mock-stickers";
import { mockAuctions } from "@/data/mock-auctions";
import { mockTrades } from "@/data/mock-trades";
import { Camera, Gavel, ArrowLeftRight, Star, Package, BookmarkX, Copy, ChevronRight } from "lucide-react";

const CURRENT_USER_ID = 1;

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
      {icon}
      <span className="text-2xl font-extrabold text-slate-800">{value}</span>
      <span className="text-xs text-slate-500 font-medium text-center">{label}</span>
    </div>
  );
}

function ActivityCard({ icon, count, label, href }) {
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

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [customAvatar, setCustomAvatar] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("profile_avatar") : null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setCustomAvatar(base64);
      localStorage.setItem("profile_avatar", base64);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-slate-600 font-medium">Tenés que iniciar sesión para ver tu perfil.</p>
        <a href="/login" className="text-sm font-semibold text-[#002B5E] underline underline-offset-2">Iniciar sesión</a>
      </div>
    );
  }

  const ownedStickers = mockStickers.filter((s) => s.quantity > 0);
  const totalOwned = ownedStickers.reduce((acc, s) => acc + s.quantity, 0);
  const totalMissing = mockMissingStickers.length;
  const totalDuplicates = ownedStickers.reduce((acc, s) => acc + Math.max(0, s.quantity - 1), 0);

  const myAuctions = mockAuctions.filter((a) => a.owner.id === CURRENT_USER_ID && a.state === "ACTIVE");
  const myTrades = mockTrades.filter((t) => t.owner.id === CURRENT_USER_ID && t.state === "ACTIVE");

  const avatarSrc = customAvatar || user?.picture;

  return (
    <main className="container mx-auto px-4 pb-24 max-w-2xl">

      {/* Avatar + datos */}
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
            <span className="text-sm font-semibold text-slate-600">Reputación: —</span>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Cambiar foto de perfil
        </button>
      </div>

      {/* Colección */}
      <div className="mt-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Mi Colección</h3>
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

      {/* Actividad */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Actividad</h3>
        <div className="grid grid-cols-2 gap-3">
          <ActivityCard
            icon={<Gavel size={18} className="text-[#002B5E]" />}
            count={myAuctions.length}
            label="Subastas activas"
            href="/auctions"
          />
          <ActivityCard
            icon={<ArrowLeftRight size={18} className="text-[#002B5E]" />}
            count={myTrades.length}
            label="Intercambios activos"
            href="/trades"
          />
        </div>
      </div>

    </main>
  );
}
