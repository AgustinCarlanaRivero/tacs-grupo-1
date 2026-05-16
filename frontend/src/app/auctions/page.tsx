"use client";

import React, { useState, useCallback, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs, { type PageTab } from "@/components/common/PageTabs";
import AuctionCard from "@/components/auction/AuctionCard";
import OfferModal from "@/components/auction/OfferModal";
import CreateAuctionModal from "@/components/auction/CreateAuctionModal";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { mockStickers } from "@/data/mock-stickers";

import { useGetUserAuctionsQuery } from "@/store/api/postApi";
import RequireAuth from "@/components/layout/RequireAuth";
import type { MockAuction, MockCollectionItem } from "@/data/types";

type AuctionTabKey = "market" | "mine";

const myCollection: MockCollectionItem[] = mockStickers.filter(
  (item) => item.quantity > 0
);

const getSearchFields = ({ sticker }: MockAuction) => [
  sticker.player.name,
  sticker.player.nationalTeam?.name,
  sticker.player.club?.name,
];

function AuctionsContent() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<AuctionTabKey>("market");
  const [selectedAuction, setSelectedAuction] = useState<MockAuction | null>(null);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [allAuctions, setAllAuctions] = useState<MockAuction[]>([]);
  const { data: auctions = [] } = useGetUserAuctionsQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  useEffect(() => {
    if (auctions.length > 0 && allAuctions.length === 0) {
      setAllAuctions(auctions as unknown as MockAuction[]);
    }
  }, [auctions, allAuctions.length]);

  const { query, setQuery, filtered } = useSearch<MockAuction>(
    allAuctions,
    useCallback(getSearchFields, [])
  );

  const marketAuctions = filtered.filter((a) => a.owner.id !== user?.id);
  const myAuctions = filtered.filter((a) => a.owner.id === user?.id);
  const activeList = tab === "market" ? marketAuctions : myAuctions;

  function handleCancel(auction: MockAuction) {
    if (
      window.confirm(`¿Cancelar la subasta de ${auction.sticker.player.name}?`)
    ) {
      setAllAuctions((prev) => prev.filter((a) => a.id !== auction.id));
    }
  }

  function handleSelectAuction(auction: MockAuction) {
    if (!isAuthenticated) {
      alert("Iniciá sesión para hacer una oferta.");
      return;
    }
    setSelectedAuction(auction);
  }

  const tabs: PageTab<AuctionTabKey>[] = [
    { key: "market", label: "Mercado" },
    ...(isAuthenticated
      ? [{ key: "mine" as const, label: "Mis subastas" }]
      : []),
  ];

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Subastas"
        subtitle="Encontrá subastas activas, pujá y llevate las figuritas más difíciles."
      />

      <PageTabs<AuctionTabKey> tabs={tabs} active={tab} onChange={setTab} />

      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por jugador, selección o club..."
          />
        </div>
        {tab === "mine" && (
          <button
            onClick={() => setShowCreateAuction(true)}
            className="shrink-0 px-4 py-2.5 bg-[#002B5E] hover:bg-[#003a7a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            + Publicar
          </button>
        )}
      </div>

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
          {activeList.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              isOwner={tab === "mine"}
              onSelect={tab === "mine" ? handleCancel : handleSelectAuction}
            />
          ))}
        </div>
      )}

      {selectedAuction && (
        <OfferModal
          post={selectedAuction}
          myCollection={myCollection}
          onClose={() => setSelectedAuction(null)}
          onSubmit={(stickers) => console.log("Puja enviada:", stickers)}
        />
      )}

      {showCreateAuction && (
        <CreateAuctionModal
          myCollection={myCollection}
          onClose={() => setShowCreateAuction(false)}
          onSubmit={({ sticker, requirements, durationHours }) => {
            console.log("Crear subasta pendiente de endpoint", {
              sticker,
              requirements,
              durationHours,
            });
            setShowCreateAuction(false);
          }}
        />
      )}
    </main>
  );
}

export default function AuctionsPage() {
  return (
    <RequireAuth>
      <AuctionsContent />
    </RequireAuth>
  );
}
