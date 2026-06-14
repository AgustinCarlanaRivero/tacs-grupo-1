"use client";

import PageHeader from "@/components/common/PageHeader";
import RequireAuth from "@/components/layout/RequireAuth";
import type { AddStickerSubmit } from "@/components/sticker/AddStickerModal";
import StickerGrid from "@/components/sticker/StickerGrid";
import type { MockCollectionItem, MockSticker } from "@/data/types";
import { useAuth } from "@/hooks/useAuth";
import type { StickerDTO } from "@/lib/schemas/stickerSchema";
import {
    useAddCollectionItemMutation,
    useAddMissingCollectionItemMutation,
    useGetCollectionQuery,
} from "@/store/api/collectionApi";

function toMockSticker(sticker: StickerDTO): MockSticker {
    return {
        number: sticker.number,
        player: {
            name: sticker.player.name,
            nationalTeam: sticker.player.nationalTeam,
            club: sticker.player.club,
            image: sticker.player.image,
        },
        type: sticker.type,
    };
}

function HomeContent() {
    const { user } = useAuth();
    const [addCollectionItem] = useAddCollectionItemMutation();
    const [addMissingCollectionItem] = useAddMissingCollectionItemMutation();

    const { data: collectionData } = useGetCollectionQuery(user?.id ?? "", {
        skip: !user?.id,
    });

    async function handleAddToCollection(item: AddStickerSubmit) {
        if (!user?.id) return;
        await addCollectionItem({ userId: user.id, item });
    }

    async function handleAddMissing(item: AddStickerSubmit) {
        if (!user?.id) return;
        await addMissingCollectionItem({ userId: user.id, item });
    }

    const collectionItems: MockCollectionItem[] =
        collectionData?.items.map(({ sticker, quantity }) => ({
            sticker: toMockSticker(sticker),
            quantity,
        })) ?? [];

    const missingItems: MockCollectionItem[] =
        collectionData?.missingStickers?.map((sticker) => ({
            sticker: toMockSticker(sticker),
            quantity: 0,
        })) ?? [];

    return (
        <main className="container mx-auto px-4 pb-20">
            <PageHeader
                title="¡Hola, Coleccionista!"
                subtitle="Acá están tus figuritas del Mundial 2026."
            />
            <StickerGrid
                collection={collectionItems}
                missingStickers={missingItems}
                onAddToCollection={handleAddToCollection}
                onAddMissing={handleAddMissing}
                editable
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
