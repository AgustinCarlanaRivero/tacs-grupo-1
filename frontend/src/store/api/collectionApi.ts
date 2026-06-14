import type { AddStickerSubmit } from "@/components/sticker/AddStickerModal";
import type { StickerDTO } from "@/lib/schemas/stickerSchema";
import type { CollectionItemDTO } from "@/lib/schemas/userSchema";
import { baseApi } from "./baseApi";

type CollectionDTO = {
    items: CollectionItemDTO[];
    missingStickers: StickerDTO[];
};

export const collectionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCollection: builder.query<CollectionDTO, string>({
            query: (userId: string) => `/users/${userId}/collection`,
            providesTags: ["Collection"],
        }),
        addCollectionItem: builder.mutation<
            CollectionItemDTO,
            { userId: string; item: AddStickerSubmit }
        >({
            query: ({ userId, item }) => ({
                url: `/users/${userId}/collection/items`,
                method: "POST",
                body: item,
            }),
            invalidatesTags: ["Collection"],
        }),
        addMissingCollectionItem: builder.mutation<
            StickerDTO,
            { userId: string; item: AddStickerSubmit }
        >({
            query: ({ userId, item }) => ({
                url: `/users/${userId}/collection/missing`,
                method: "POST",
                body: item,
            }),
            invalidatesTags: ["Collection"],
        }),
        updateCollectionItemQuantity: builder.mutation<
            CollectionItemDTO,
            { userId: string; stickerNumber: number; quantity: number }
        >({
            query: ({ userId, stickerNumber, quantity }) => ({
                url: `/users/${userId}/collection/items/${stickerNumber}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: ["Collection"],
        }),
        removeCollectionItem: builder.mutation<
            void,
            { userId: string; stickerNumber: number }
        >({
            query: ({ userId, stickerNumber }) => ({
                url: `/users/${userId}/collection/items/${stickerNumber}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Collection"],
        }),
        removeMissingSticker: builder.mutation<
            void,
            { userId: string; stickerNumber: number }
        >({
            query: ({ userId, stickerNumber }) => ({
                url: `/users/${userId}/collection/missing/${stickerNumber}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Collection"],
        }),
    }),
});

export const {
    useGetCollectionQuery,
    useAddCollectionItemMutation,
    useAddMissingCollectionItemMutation,
    useUpdateCollectionItemQuantityMutation,
    useRemoveCollectionItemMutation,
    useRemoveMissingStickerMutation,
} = collectionApi;
