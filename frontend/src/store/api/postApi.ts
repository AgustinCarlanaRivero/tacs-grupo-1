import type { PostCreateRequest } from "@/lib/schemas/postSchema";
import {
    AuctionPostDTO,
    DirectTradePostDTO,
    PostDTO,
} from "@/lib/schemas/postSchema";
import { baseApi } from "./baseApi";
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
        createPost: builder.mutation<
            PostDTO,
            { userId: string; post: PostCreateRequest }
        >({
            query: ({ userId, post }) => ({
                url: `/users/${userId}/posts`,
                method: "POST",
                body: post,
            }),
            invalidatesTags: ["Posts"],
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
    useCreatePostMutation,
    useGetUserAuctionsQuery,
    useGetUserDirectTradesQuery,
    useGetPostsQuery,
} = postApi;
