"use client";

import PageHeader from "@/components/common/PageHeader";
import RequireAuth from "@/components/layout/RequireAuth";
import type { AddStickerSubmit } from "@/components/sticker/AddStickerModal";
import StickerGrid from "@/components/sticker/StickerGrid";
import { mockMissingStickers } from "@/data/mock-stickers";
import type { MockCollectionItem, MockSticker } from "@/data/types";
import { useAuth } from "@/hooks/useAuth";
import type { StickerDTO } from "@/lib/schemas/stickerSchema";
import {
    useAddCollectionItemMutation,
    useAddMissingCollectionItemMutation,
    useGetCollectionQuery,
} from "@/store/api/collectionApi";
import { useState } from "react";

function toMockSticker(sticker: StickerDTO): MockSticker {
    return {
        number: sticker.number,
        player: {
            name: sticker.player.name,
            nationalTeam: sticker.player.nationalTeam ?? { name: "" },
            club: sticker.player.club ?? { name: "" },
            image: sticker.player.image,
        },
        category: sticker.type,
    };
}

function toMockCollectionItem(item: AddStickerSubmit): MockCollectionItem {
    return {
        sticker: {
            number: item.sticker.number,
            player: {
                name: item.sticker.player.name,
                nationalTeam: item.sticker.player.nationalTeam ?? { name: "" },
                club: item.sticker.player.club ?? { name: "" },
                image: item.sticker.player.image ?? "",
            },
            category: item.sticker.type,
        },
        quantity: item.quantity,
    };
}

function HomeContent() {
    const { user } = useAuth();
    const [localMissingStickers, setLocalMissingStickers] =
        useState<MockCollectionItem[]>(mockMissingStickers);
    const [addCollectionItem] = useAddCollectionItemMutation();
    const [addMissingCollectionItem] = useAddMissingCollectionItemMutation();

    const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", {
        skip: !user?.id,
    });

    async function handleAddToCollection(item: AddStickerSubmit) {
        if (!user?.id) return;
        await addCollectionItem({
            userId: user.id,
            item,
        });
    }

    async function handleAddMissing(item: AddStickerSubmit) {
        if (!user?.id) return;
        await addMissingCollectionItem({
            userId: user.id,
            item,
        });
        setLocalMissingStickers((prev) => [
            ...prev,
            { ...toMockCollectionItem(item), quantity: 0 },
        ]);
    }

    const collectionItems =
        collectionData?.items.map(({ sticker, quantity }) => ({
            sticker: toMockSticker(sticker),
            quantity,
        })) ?? [];

    return (
        <main className="container mx-auto px-4 pb-20">
            <PageHeader
                title="¡Hola, Coleccionista!"
                subtitle="Acá están tus figuritas del Mundial 2026."
            />
            <StickerGrid
                collection={collectionItems}
                missingStickers={
                    collectionData?.missingStickers?.length
                        ? collectionData.missingStickers.map((sticker) => ({
                              sticker: toMockSticker(sticker),
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
