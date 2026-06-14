import { baseApi } from "./baseApi";

export interface OfferableSticker {
  number: number;
  title: string;
}

export interface SuggestionDTO {
  userId: string;
  username: string;
  offerableStickers: OfferableSticker[];
}

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export const matchingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuggestionsByUser: builder.query<SuggestionDTO[], string>({
      query: (userId: string) => `/users/${userId}/suggestions`,
      transformResponse: (response: PaginatedResponse<SuggestionDTO>) => response.data,
      providesTags: ["Posts"],
    }),
  }),
});

export const { useGetSuggestionsByUserQuery } = matchingApi;
