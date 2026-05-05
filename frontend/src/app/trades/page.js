"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs from "@/components/common/PageTabs";
import TradeCard from "@/components/trade/TradeCard";
import TradeOffersModal from "@/components/trade/TradeOffersModal";
import OfferModal from "@/components/auction/OfferModal";
import SuggestionCard from "@/components/trade/SuggestionCard";
import CreateTradeModal from "@/components/trade/CreateTradeModal";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { mockTrades } from "@/data/mock-trades";
import { mockStickers } from "@/data/mock-stickers";
import { mockOffers } from "@/data/mock-offers";
import { mockSuggestions } from "@/data/mock-suggestions";
import { currentUser } from "@/data/mock-user";

const myCollection = mockStickers.filter(item => item.quantity > 0);

function TradesPageInner() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "suggestions" && isAuthenticated ? "suggestions" : "market";
  const [tab, setTab] = useState(initialTab);
  const [allTrades, setAllTrades] = useState(mockTrades);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [showCreateTrade, setShowCreateTrade] = useState(false);

  const { query, setQuery, filtered } = useSearch(allTrades, useCallback(({ sticker }) => [
    sticker.player.name,
    sticker.player.nationalTeam?.name,
    sticker.player.club?.name,
  ], []));

  const marketTrades = filtered.filter(t => t.owner.id !== currentUser.id);
  const myTrades = filtered.filter(t => t.owner.id === currentUser.id);

  function cancelTrade(trade) {
    if (window.confirm(`¿Cancelar el intercambio de ${trade.sticker.player.name}?`)) {
      setAllTrades(prev => prev.filter(t => t.id !== trade.id));
      setSelectedTrade(null);
    }
  }

  function handleSelectTrade(trade) {
    if (!isAuthenticated) {
      alert("Iniciá sesión para hacer una oferta.");
      return;
    }
    setSelectedTrade(trade);
  }

  function handleAcceptSuggestion(suggestion) {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }

  function handleRejectSuggestion(suggestion) {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }

  const tabs = [
    { key: "market", label: "Mercado" },
    ...(isAuthenticated ? [
      { key: "mine", label: "Mis intercambios" },
      { key: "suggestions", label: "Sugerencias", badge: suggestions.length || null },
    ] : []),
  ];

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Intercambios"
        subtitle="Encontrá figuritas que te faltan y ofrecé las tuyas."
      />

      <PageTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab !== "suggestions" && (
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
              onClick={() => setShowCreateTrade(true)}
              className="shrink-0 px-4 py-2.5 bg-[#002B5E] hover:bg-[#003a7a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              + Publicar
            </button>
          )}
        </div>
      )}

      {tab === "suggestions" && (
        suggestions.length === 0 ? (
          <EmptyState message="No tenés sugerencias de intercambio por ahora." />
        ) : (
          <div className="mt-4 max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-3">
              {suggestions.length} {suggestions.length === 1 ? "sugerencia" : "sugerencias"} disponibles
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={() => handleAcceptSuggestion(suggestion)}
                  onReject={() => handleRejectSuggestion(suggestion)}
                />
              ))}
            </div>
          </div>
        )
      )}

      {tab !== "suggestions" && (
        <>
          {(tab === "market" ? marketTrades : myTrades).length === 0 ? (
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
              {(tab === "market" ? marketTrades : myTrades).map(trade => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  isOwner={tab === "mine"}
                  onSelect={tab === "mine" ? setSelectedTrade : handleSelectTrade}
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

          {showCreateTrade && (
            <CreateTradeModal
              myCollection={myCollection}
              onClose={() => setShowCreateTrade(false)}
              onSubmit={sticker => {
                const newTrade = {
                  id: Date.now(),
                  state: "ACTIVE",
                  sticker,
                  owner: currentUser,
                };
                setAllTrades(prev => [newTrade, ...prev]);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}

export default function TradesPage() {
  return (
    <Suspense>
      <TradesPageInner />
    </Suspense>
  );
}
