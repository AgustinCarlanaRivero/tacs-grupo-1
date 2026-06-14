"use client";

import React, { useState, useCallback } from "react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import PageTabs, { type PageTab } from "@/components/common/PageTabs";
import AuctionCard from "@/components/auction/AuctionCard";
import OfferModal from "@/components/auction/OfferModal";
import CreateAuctionModal from "@/components/auction/CreateAuctionModal";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreatePostMutation,
  useClosePostMutation,
  useDeletePostMutation,
  useGetMarketPostsQuery,
  useGetUserAuctionsQuery,
} from "@/store/api/postApi";
import { useGetCollectionQuery } from "@/store/api/collectionApi";
import { useCreateOfferMutation } from "@/store/api/offerApi";
import RequireAuth from "@/components/layout/RequireAuth";
import type { AuctionPostDTO } from "@/lib/schemas/postSchema";
import type { MockCollectionItem } from "@/data/types";
import type { OfferSubmitItem } from "@/components/auction/OfferModal";

type AuctionTabKey = "market" | "mine";

function AuctionsContent() {
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState<AuctionTabKey>("market");
  const [selectedAuction, setSelectedAuction] = useState<AuctionPostDTO | null>(null);
  const [showCreateAuction, setShowCreateAuction] = useState(false);

  const [createPost] = useCreatePostMutation();
  const [closePost] = useClosePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [createOffer] = useCreateOfferMutation();

  const { data: marketAuctionsRaw = [] } = useGetMarketPostsQuery(
    { type: "AUCTION", state: "ACTIVE" },
    { skip: tab !== "market" }
  );
  const { data: myAuctionsRaw = [] } = useGetUserAuctionsQuery(user?.id ?? "", {
    skip: !user?.id || tab !== "mine",
  });
  const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  const marketAuctions = marketAuctionsRaw.filter(
    (p): p is AuctionPostDTO => p.type === "AUCTION" && p.owner.id !== user?.id
  );
  const myAuctions = myAuctionsRaw;

  const activeList = tab === "market" ? marketAuctions : myAuctions;

  const { query, setQuery, filtered } = useSearch<AuctionPostDTO>(
    activeList,
    useCallback(
      ({ sticker }: AuctionPostDTO) => [
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

  async function handleCancel(auction: AuctionPostDTO) {
    if (!user?.id) return;
    if (!window.confirm(`¿Cancelar la subasta de ${auction.sticker.player.name}?`)) return;
    try {
      await closePost({ userId: user.id, postId: auction.id }).unwrap();
    } catch {
      alert("No se pudo cancelar la subasta. Intentá nuevamente.");
    }
  }

  async function handleDelete(auction: AuctionPostDTO) {
    if (!user?.id) return;
    if (!window.confirm(`¿Eliminar definitivamente la subasta de ${auction.sticker.player.name}?`)) return;
    try {
      await deletePost({ userId: user.id, postId: auction.id }).unwrap();
    } catch {
      alert("No se pudo eliminar la subasta. Intentá nuevamente.");
    }
  }

  function handleSelectAuction(auction: AuctionPostDTO) {
    if (!isAuthenticated) {
      alert("Iniciá sesión para hacer una oferta.");
      return;
    }
    setSelectedAuction(auction);
  }

  const tabs: PageTab<AuctionTabKey>[] = [
    { key: "market", label: "Mercado" },
    ...(isAuthenticated ? [{ key: "mine" as const, label: "Mis subastas" }] : []),
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

      {filtered.length === 0 ? (
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
          {filtered.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              isOwner={tab === "mine"}
              onSelect={tab === "mine" ? handleCancel : handleSelectAuction}
              onDelete={tab === "mine" ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {selectedAuction && (
        <OfferModal
          post={selectedAuction}
          myCollection={myCollection}
          onClose={() => setSelectedAuction(null)}
          onSubmit={async (offered: OfferSubmitItem[]) => {
            if (!user?.id) return;
            try {
              await createOffer({
                userId: selectedAuction.owner.id,
                postId: selectedAuction.id,
                offered,
              }).unwrap();
            } catch {
              alert("No se pudo enviar la puja. Intentá nuevamente.");
            }
          }}
        />
      )}

      {showCreateAuction && (
        <CreateAuctionModal
          myCollection={myCollection}
          onClose={() => setShowCreateAuction(false)}
          onSubmit={async (post) => {
            if (!user?.id) return;
            try {
              await createPost({ userId: user.id, post }).unwrap();
              setShowCreateAuction(false);
            } catch {
              alert("No se pudo publicar la subasta. Intentá nuevamente.");
            }
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
