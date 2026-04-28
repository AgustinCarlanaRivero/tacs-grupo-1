"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import AuctionCard from "@/components/AuctionCard";
import OfferModal from "@/components/OfferModal";
import { mockAuctions } from "@/data/mock-auctions";
import { mockStickers } from "@/data/mock-stickers";

const myCollection = mockStickers.filter(item => item.quantity > 0);

export default function AuctionsPage() {
  const [search, setSearch] = useState("");
  const [selectedAuction, setSelectedAuction] = useState(null);

  const filtered = mockAuctions.filter(({ sticker }) => {
    const q = search.toLowerCase();
    return (
      sticker.player.name.toLowerCase().includes(q) ||
      (sticker.player.nationalTeam?.name || "").toLowerCase().includes(q) ||
      (sticker.player.club?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Subastas"
        subtitle="Encontrá subastas activas, pujá y llevate las figuritas más difíciles."
      />

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por jugador, selección o club..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5E]/20 focus:border-[#002B5E] transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={search ? `No se encontraron subastas para "${search}".` : "No hay subastas activas."}
        />
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {filtered.map(auction => (
            <AuctionCard key={auction.id} auction={auction} onSelect={setSelectedAuction} />
          ))}
        </div>
      )}

      {selectedAuction && (
        <OfferModal
          post={selectedAuction}
          myCollection={myCollection}
          onClose={() => setSelectedAuction(null)}
          onSubmit={stickers => console.log("Puja enviada a la subasta:", stickers)}
        />
      )}
    </main>
  );
}
