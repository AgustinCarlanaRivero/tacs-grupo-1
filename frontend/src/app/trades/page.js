"use client";

import React, { useState, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs from "@/components/common/PageTabs";
import TradeCard from "@/components/trade/TradeCard";
import TradeOffersModal from "@/components/trade/TradeOffersModal";
import OfferModal from "@/components/auction/OfferModal";
import { useSearch } from "@/hooks/useSearch";
import { mockTrades } from "@/data/mock-trades";
import { mockStickers } from "@/data/mock-stickers";
import { mockOffers } from "@/data/mock-offers";
import { currentUser } from "@/data/mock-user";

const myCollection = mockStickers.filter(item => item.quantity > 0);

const getSearchFields = ({ sticker }) => [
  sticker.player.name,
  sticker.player.nationalTeam?.name,
  sticker.player.club?.name,
];

export default function TradesPage() {
  const [tab, setTab] = useState("market");
  const [allTrades, setAllTrades] = useState(mockTrades);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const { query, setQuery, filtered } = useSearch(allTrades, useCallback(getSearchFields, []));

  const marketTrades = filtered.filter(t => t.owner.id !== currentUser.id);
  const myTrades = filtered.filter(t => t.owner.id === currentUser.id);
  const activeList = tab === "market" ? marketTrades : myTrades;

  function cancelTrade(trade) {
    if (window.confirm(`¿Cancelar el intercambio de ${trade.sticker.player.name}?`)) {
      setAllTrades(prev => prev.filter(t => t.id !== trade.id));
      setSelectedTrade(null);
    }
  }

  const tabs = [
    { key: "market", label: "Mercado" },
    { key: "mine", label: "Mis intercambios" },
  ];

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Intercambios"
        subtitle="Encontrá figuritas que te faltan y ofrecé las tuyas."
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
              ? `No se encontraron figuritas para "${query}".`
              : tab === "mine"
                ? "No publicaste ningún intercambio todavía."
                : "No hay intercambios disponibles."
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {activeList.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              isOwner={tab === "mine"}
              onSelect={setSelectedTrade}
            />
          ))}
        </div>
      )}

      {selectedTrade && tab === "mine" && (
        <TradeOffersModal
          trade={selectedTrade}
          offers={mockOffers[selectedTrade.id] ?? []}
          onClose={() => setSelectedTrade(null)}
          onCancelTrade={() => cancelTrade(selectedTrade)}
        />
      )}

      {selectedTrade && tab === "market" && (
        <OfferModal
          post={selectedTrade}
          myCollection={myCollection}
          onClose={() => setSelectedTrade(null)}
          onSubmit={stickers => console.log("Oferta enviada:", stickers)}
        />
      )}
    </main>
  );
}
