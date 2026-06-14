"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs, { type PageTab } from "@/components/common/PageTabs";
import TradeCard from "@/components/trade/TradeCard";
import TradeOffersModal from "@/components/trade/TradeOffersModal";
import OfferModal from "@/components/auction/OfferModal";
import SuggestionCard from "@/components/trade/SuggestionCard";
import CreateTradeModal from "@/components/trade/CreateTradeModal";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { useGetSuggestionsByUserQuery } from "@/store/api/matchingApi";
import {
  useCreatePostMutation,
  useClosePostMutation,
  useGetMarketPostsQuery,
  useGetUserDirectTradesQuery,
} from "@/store/api/postApi";
import { useGetCollectionQuery } from "@/store/api/collectionApi";
import { useCreateOfferMutation } from "@/store/api/offerApi";
import type { OfferSubmitItem } from "@/components/auction/OfferModal";
import RequireAuth from "@/components/layout/RequireAuth";
import type { DirectTradePostDTO } from "@/lib/schemas/postSchema";
import type { MockCollectionItem } from "@/data/types";
import type { SuggestionDTO } from "@/store/api/matchingApi";

type TradeTabKey = "market" | "mine" | "suggestions";

function TradesPageInner() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab: TradeTabKey =
    searchParams.get("tab") === "suggestions" && isAuthenticated ? "suggestions" : "market";
  const [tab, setTab] = useState<TradeTabKey>(initialTab);
  const [selectedTrade, setSelectedTrade] = useState<DirectTradePostDTO | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [showCreateTrade, setShowCreateTrade] = useState(false);

  const [createPost] = useCreatePostMutation();
  const [closePost] = useClosePostMutation();
  const [createOffer] = useCreateOfferMutation();

  const { data: suggestionsRaw = [] } = useGetSuggestionsByUserQuery(user?.id ?? "", {
    skip: !user?.id || tab !== "suggestions",
  });
  const suggestions = suggestionsRaw.filter((s) => !dismissedIds.includes(s.userId));

  const { data: marketTradesRaw = [] } = useGetMarketPostsQuery(
    { type: "DIRECT_TRADE", state: "ACTIVE" },
    { skip: tab !== "market" }
  );
  const { data: myTradesRaw = [] } = useGetUserDirectTradesQuery(user?.id ?? "", {
    skip: !user?.id || tab !== "mine",
  });
  const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  const marketTrades = marketTradesRaw.filter(
    (p): p is DirectTradePostDTO => p.type === "DIRECT_TRADE" && p.owner.id !== user?.id
  );
  const myTrades = myTradesRaw;

  const activeList = tab === "market" ? marketTrades : myTrades;

  const { query, setQuery, filtered } = useSearch<DirectTradePostDTO>(
    tab !== "suggestions" ? activeList : [],
    useCallback(
      ({ sticker }: DirectTradePostDTO) => [
        sticker.player.name,
        sticker.player.nationalTeam?.name,
        sticker.player.club?.name,
      ],
      []
    )
  );

  const myCollection: MockCollectionItem[] = (collectionData?.items ?? []).map((item) => ({
    sticker: {
      number: item.sticker.number,
      player: item.sticker.player,
      type: item.sticker.type,
    },
    quantity: item.quantity,
  }));

  async function cancelTrade(trade: DirectTradePostDTO) {
    if (!user?.id) return;
    if (!window.confirm(`¿Cancelar el intercambio de ${trade.sticker.player.name}?`)) return;
    try {
      await closePost({ userId: user.id, postId: trade.id }).unwrap();
      setSelectedTrade(null);
    } catch {
      alert("No se pudo cancelar el intercambio. Intentá nuevamente.");
    }
  }

  function handleSelectTrade(trade: DirectTradePostDTO) {
    if (!isAuthenticated) {
      alert("Iniciá sesión para hacer una oferta.");
      return;
    }
    setSelectedTrade(trade);
  }

  function handleAcceptSuggestion(suggestion: SuggestionDTO) {
    setDismissedIds((prev) => [...prev, suggestion.userId]);
  }

  function handleRejectSuggestion(suggestion: SuggestionDTO) {
    setDismissedIds((prev) => [...prev, suggestion.userId]);
  }

  const tabs: PageTab<TradeTabKey>[] = [
    { key: "market", label: "Mercado" },
    ...(isAuthenticated
      ? ([
          { key: "mine", label: "Mis intercambios" },
          {
            key: "suggestions",
            label: "Sugerencias",
            badge: suggestionsRaw.length || null,
          },
        ] as PageTab<TradeTabKey>[])
      : []),
  ];

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="Intercambios"
        subtitle="Encontrá figuritas que te faltan y ofrecé las tuyas."
      />

      <PageTabs<TradeTabKey> tabs={tabs} active={tab} onChange={setTab} />

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

      {tab === "suggestions" &&
        (suggestions.length === 0 ? (
          <EmptyState message="No tenés sugerencias de intercambio por ahora." />
        ) : (
          <div className="mt-4 max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-3">
              {suggestions.length}{" "}
              {suggestions.length === 1 ? "sugerencia" : "sugerencias"} disponibles
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.userId}
                  suggestion={suggestion}
                  onAccept={() => handleAcceptSuggestion(suggestion)}
                  onReject={() => handleRejectSuggestion(suggestion)}
                />
              ))}
            </div>
          </div>
        ))}

      {tab !== "suggestions" && (
        <>
          {filtered.length === 0 ? (
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
              {filtered.map((trade) => (
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
              onClose={() => setSelectedTrade(null)}
              onCancelTrade={() => cancelTrade(selectedTrade)}
            />
          )}

          {selectedTrade && tab === "market" && (
            <OfferModal
              post={selectedTrade}
              myCollection={myCollection}
              onClose={() => setSelectedTrade(null)}
              onSubmit={async (offered: OfferSubmitItem[]) => {
                if (!user?.id) return;
                try {
                  await createOffer({
                    userId: selectedTrade.owner.id,
                    postId: selectedTrade.id,
                    offered,
                  }).unwrap();
                } catch {
                  alert("No se pudo enviar la oferta. Intentá nuevamente.");
                }
              }}
            />
          )}

          {showCreateTrade && (
            <CreateTradeModal
              myCollection={myCollection}
              onClose={() => setShowCreateTrade(false)}
              onSubmit={async (post) => {
                if (!user?.id) return;
                try {
                  await createPost({ userId: user.id, post }).unwrap();
                  setShowCreateTrade(false);
                } catch {
                  alert("No se pudo publicar el intercambio. Intentá nuevamente.");
                }
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
    <RequireAuth>
      <Suspense>
        <TradesPageInner />
      </Suspense>
    </RequireAuth>
  );
}
