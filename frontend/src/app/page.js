"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/common/PageHeader";
import StickerGrid from "@/components/sticker/StickerGrid";
import { mockMissingStickers } from "@/data/mock-stickers";
import {
  useAddCollectionItemMutation,
  useGetCollectionQuery,
} from "@/store/api/collectionApi";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [localMissingStickers, setLocalMissingStickers] =
    useState(mockMissingStickers);
  const [addCollectionItem] = useAddCollectionItemMutation();

  const { data: collectionData } = useGetCollectionQuery(user?.id, {
    skip: !user?.id,
  });

  async function handleAddToCollection(item) {
    if (!user?.id) return;
    console.log("item", item);
    console.log("user", user);
    await addCollectionItem({ userId: user.id, item });
  }

  function handleAddMissing(item) {
    setLocalMissingStickers((prev) => [...prev, { ...item, quantity: 0 }]);
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#002B5E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 pb-20">
      <PageHeader
        title="¡Hola, Coleccionista!"
        subtitle="Acá están tus figuritas del Mundial 2026."
      />
      <StickerGrid
        collection={collectionData?.items ?? []}
        missingStickers={
          collectionData?.missingStickers?.length
            ? collectionData.missingStickers.map((sticker) => ({
                sticker,
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
