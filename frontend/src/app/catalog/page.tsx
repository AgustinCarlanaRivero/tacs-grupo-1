"use client";

import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import RequireAuth from "@/components/layout/RequireAuth";
import StickerSearchInput from "@/components/common/StickerSearchInput";
import StickerCard from "@/components/sticker/StickerCard";
import EmptyState from "@/components/common/EmptyState";
import type { StickerDTO } from "@/lib/schemas/stickerSchema";
import type { MockSticker } from "@/data/types";
import {
  useGetStickersQuery,
  useGetStickerTeamsQuery,
  useGetStickerClubsQuery,
} from "@/store/api/stickerApi";

function toMockSticker(sticker: StickerDTO): MockSticker {
  return {
    number: sticker.number,
    player: {
      name: sticker.player.name,
      nationalTeam: sticker.player.nationalTeam,
      club: sticker.player.club,
      image: sticker.player.image,
    },
    type: sticker.type,
  };
}

const SELECT_CLASSES =
  "px-3 py-2 border border-slate-200 bg-slate-50 text-sm text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all";

function CatalogContent() {
  const [team, setTeam] = useState("");
  const [club, setClub] = useState("");
  const [type, setType] = useState<"" | "REGULAR" | "SHINY">("");
  const [query, setQuery] = useState("");

  const { data: teams = [] } = useGetStickerTeamsQuery();
  const { data: clubs = [] } = useGetStickerClubsQuery();
  const { data: stickers = [], isFetching } = useGetStickersQuery({
    team: team || undefined,
    club: club || undefined,
    type: type || undefined,
    query: query || undefined,
  });

  return (
    <main className="container mx-auto px-4 pb-24">
      <PageHeader
        title="Catálogo de figuritas"
        subtitle="Explorá todas las figuritas del álbum del Mundial 2026."
      />

      <div className="flex flex-col gap-3 mb-6">
        <StickerSearchInput value={query} onChange={setQuery} />
        <div className="flex flex-wrap gap-3">
          <select value={team} onChange={(e) => setTeam(e.target.value)} className={SELECT_CLASSES}>
            <option value="">Todas las selecciones</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={club} onChange={(e) => setClub(e.target.value)} className={SELECT_CLASSES}>
            <option value="">Todos los clubes</option>
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "" | "REGULAR" | "SHINY")}
            className={SELECT_CLASSES}
          >
            <option value="">Todos los tipos</option>
            <option value="REGULAR">Regular</option>
            <option value="SHINY">Brillante</option>
          </select>
        </div>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stickers.length === 0 ? (
        <EmptyState message="No se encontraron figuritas con esos filtros." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {stickers.map((sticker) => (
            <StickerCard key={sticker.number} sticker={toMockSticker(sticker)} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function CatalogPage() {
  return (
    <RequireAuth>
      <CatalogContent />
    </RequireAuth>
  );
}
