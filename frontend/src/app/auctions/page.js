"use client";

import React, { useState, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs from "@/components/common/PageTabs";
import AuctionCard from "@/components/auction/AuctionCard";
import OfferModal from "@/components/auction/OfferModal";
import { useSearch } from "@/hooks/useSearch";
import { mockAuctions } from "@/data/mock-auctions";
import { mockStickers } from "@/data/mock-stickers";
import { currentUser } from "@/data/mock-user";

const myCollection = mockStickers.filter(item => item.quantity > 0);

const getSearchFields = ({ sticker }) => [
  sticker.player.name,
  sticker.player.nationalTeam?.name,
  sticker.player.club?.name,
];

export default function AuctionsPage() {
  const [tab, setTab] = useState("market");
  const [allAuctions, setAllAuctions] = useState(mockAuctions);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const { query, setQuery, filtered } = useSearch(allAuctions, useCallback(getSearchFields, []));

  const marketAuctions = filtered.filter(a => a.owner.id !== currentUser.id);
  const myAuctions = filtered.filter(a => a.owner.id === currentUser.id);
  const activeList = tab === "market" ? marketAuctions : myAuctions;

  function handleCancel(auction) {
    if (window.confirm(`¿Cancelar la subasta de ${auction.sticker.player.name}?`)) {
      setAllAuctions(prev => prev.filter(a => a.id !== auction.id));
    }
  }

  const tabs = [
    { key: "market", label: "Mercado" },
    { key: "mine", label: "Mis subastas" },
  ];

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Subastas"
        subtitle="Encontrá subastas activas, pujá y llevate las figuritas más difíciles."
      />

      <PageTabs tabs={tabs} active={tab} onChange={setTab} />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Buscar por jugador, selección o club..."
      />

      {activeList.length === 0 ? (
        <EmptyState
          message={
            query
              ? `No se encontraron subastas para "${query}".`
              : tab === "mine"
                ? "No publicaste ninguna subasta todavía."
                : "No hay subastas activas."
          }
        />
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {activeList.map(auction => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              isOwner={tab === "mine"}
              onSelect={tab === "mine" ? handleCancel : setSelectedAuction}
            />
          ))}
        </div>
      )}

      {selectedAuction && (
        <OfferModal
          post={selectedAuction}
          myCollection={myCollection}
          onClose={() => setSelectedAuction(null)}
          onSubmit={stickers => console.log("Puja enviada:", stickers)}
        />
      )}
    </main>
  );
}
