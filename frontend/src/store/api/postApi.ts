import { baseApi } from "./baseApi";
import {
  AuctionPostDTO,
  DirectTradePostDTO,
  PostDTO,
} from "@/lib/schemas/postSchema";

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostDTO[], string>({
      query: (userId: string) => `/users/${userId}/posts`,
      transformResponse: (response: PaginatedResponse<PostDTO>) =>
        response.data,
      providesTags: ["Posts"],
    }),
    getUserAuctions: builder.query<AuctionPostDTO[], string>({
      query: (userId: string) => `/users/${userId}/posts`,
      transformResponse: (response: PaginatedResponse<PostDTO>) => {
        return response.data.filter(
          (post) => post.type === "AUCTION"
        ) as AuctionPostDTO[];
      },
      providesTags: ["Posts"],
    }),
    getUserDirectTrades: builder.query<DirectTradePostDTO[], string>({
      query: (userId: string) => `/users/${userId}/posts`,
      transformResponse: (response: PaginatedResponse<PostDTO>) => {
        return response.data.filter(
          (post) => post.type === "DIRECT_TRADE"
        ) as DirectTradePostDTO[];
      },
      providesTags: ["Posts"],
    }),
  }),
});

export const {
  useGetUserAuctionsQuery,
  useGetUserDirectTradesQuery,
  useGetPostsQuery,
} = postApi;
