import { CollectionItemDTO } from "@/lib/schemas/userSchema";
import { StickerDTO } from "@/lib/schemas/stickerSchema";
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
      { userId: string; item: CollectionItemDTO }
    >({
      query: ({ userId, item }) => ({
        url: `/users/${userId}/collection/items`,
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Collection"],
    }),
  }),
});

export const { useGetCollectionQuery, useAddCollectionItemMutation } =
  collectionApi;
