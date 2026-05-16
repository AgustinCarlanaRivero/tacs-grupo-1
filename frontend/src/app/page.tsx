"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import StickerGrid from "@/components/sticker/StickerGrid";
import RequireAuth from "@/components/layout/RequireAuth";
import type { AddStickerSubmit } from "@/components/sticker/AddStickerModal";
import { mockMissingStickers } from "@/data/mock-stickers";
import {
  useAddCollectionItemMutation,
  useGetCollectionQuery,
} from "@/store/api/collectionApi";
import type { CollectionItemDTO } from "@/lib/schemas/userSchema";
import type { MockCollectionItem } from "@/data/types";

function HomeContent() {
  const { user } = useAuth();
  const [localMissingStickers, setLocalMissingStickers] =
    useState<MockCollectionItem[]>(mockMissingStickers);
  const [addCollectionItem] = useAddCollectionItemMutation();

  const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  async function handleAddToCollection(item: AddStickerSubmit) {
    if (!user?.id) return;
    await addCollectionItem({
      userId: user.id,
      item: item as unknown as CollectionItemDTO,
    });
  }

  function handleAddMissing(item: AddStickerSubmit) {
    setLocalMissingStickers((prev) => [
      ...prev,
      { ...(item as unknown as MockCollectionItem), quantity: 0 },
    ]);
  }

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="¡Hola, Coleccionista!"
        subtitle="Acá están tus figuritas del Mundial 2026."
      />
      <StickerGrid
        collection={(collectionData?.items ?? []) as unknown as MockCollectionItem[]}
        missingStickers={
          collectionData?.missingStickers?.length
            ? collectionData.missingStickers.map((sticker) => ({
                sticker: sticker as unknown as MockCollectionItem["sticker"],
                quantity: 0,
              }))
            : localMissingStickers
        }
        onAddToCollection={handleAddToCollection}
        onAddMissing={handleAddMissing}
      />
    </main>
  );
}

export default function Home() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
