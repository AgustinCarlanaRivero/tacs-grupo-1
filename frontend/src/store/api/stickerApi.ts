import { StickerDTO } from "@/lib/schemas/stickerSchema";
import { baseApi } from "./baseApi";

export const stickersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStickers: builder.query<StickerDTO[], void>({
      query: () => "/stickers",
      providesTags: ["Stickers"],
    }),
  }),
});

export const { useGetStickersQuery } = stickersApi;
