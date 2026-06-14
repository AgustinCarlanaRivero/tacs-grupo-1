import { StickerDTO } from "@/lib/schemas/stickerSchema";
import { baseApi } from "./baseApi";

export type StickerFilters = {
  team?: string;
  club?: string;
  type?: "REGULAR" | "SHINY";
  query?: string;
};

function buildStickerQuery(filters: StickerFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.team) params.set("team", filters.team);
  if (filters.club) params.set("club", filters.club);
  if (filters.type) params.set("type", filters.type);
  if (filters.query) params.set("query", filters.query);
  const qs = params.toString();
  return qs ? `/stickers?${qs}` : "/stickers";
}

export const stickersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStickers: builder.query<StickerDTO[], StickerFilters | void>({
      query: (filters) => buildStickerQuery(filters ?? undefined),
      providesTags: ["Stickers"],
    }),
    getStickerTeams: builder.query<string[], void>({
      query: () => "/stickers/teams",
      providesTags: ["Stickers"],
    }),
    getStickerClubs: builder.query<string[], void>({
      query: () => "/stickers/clubs",
      providesTags: ["Stickers"],
    }),
  }),
});

export const {
  useGetStickersQuery,
  useGetStickerTeamsQuery,
  useGetStickerClubsQuery,
} = stickersApi;
