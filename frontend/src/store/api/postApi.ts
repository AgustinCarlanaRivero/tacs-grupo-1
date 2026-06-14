import type { PostCreateRequest } from "@/lib/schemas/postSchema";
import {
    AuctionPostDTO,
    DirectTradePostDTO,
    PostDTO,
    PostStateDTO,
    PostTypeDTO,
} from "@/lib/schemas/postSchema";
import { baseApi } from "./baseApi";

type PaginatedResponse<T> = {
    data: T[];
    page: number;
    limit: number;
    total: number;
};

type MarketPostsArgs = {
    type?: PostTypeDTO;
    state?: PostStateDTO;
};

type ClosePostArgs = {
    userId: string;
    postId: string;
};

export const postApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // All posts for a user (own posts)
        getPosts: builder.query<PostDTO[], string>({
            query: (userId: string) => `/users/${userId}/posts`,
            transformResponse: (response: PaginatedResponse<PostDTO>) => response.data,
            providesTags: ["Posts"],
        }),
        // Market: all active posts across all users
        getMarketPosts: builder.query<PostDTO[], MarketPostsArgs>({
            query: ({ type, state }) => {
                const params = new URLSearchParams();
                if (type) params.set("type", type);
                if (state) params.set("state", state);
                const qs = params.toString();
                return `/posts${qs ? `?${qs}` : ""}`;
            },
            transformResponse: (response: PaginatedResponse<PostDTO>) => response.data,
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
        closePost: builder.mutation<PostDTO, ClosePostArgs>({
            query: ({ userId, postId }) => ({
                url: `/users/${userId}/posts/${postId}/state`,
                method: "PATCH",
                body: { state: "CLOSED" },
            }),
            invalidatesTags: ["Posts"],
        }),
        getUserAuctions: builder.query<AuctionPostDTO[], string>({
            query: (userId: string) => `/users/${userId}/posts?type=AUCTION`,
            transformResponse: (response: PaginatedResponse<PostDTO>) =>
                response.data.filter((post) => post.type === "AUCTION") as AuctionPostDTO[],
            providesTags: ["Posts"],
        }),
        getUserDirectTrades: builder.query<DirectTradePostDTO[], string>({
            query: (userId: string) => `/users/${userId}/posts?type=DIRECT_TRADE`,
            transformResponse: (response: PaginatedResponse<PostDTO>) =>
                response.data.filter((post) => post.type === "DIRECT_TRADE") as DirectTradePostDTO[],
            providesTags: ["Posts"],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useGetMarketPostsQuery,
    useCreatePostMutation,
    useClosePostMutation,
    useGetUserAuctionsQuery,
    useGetUserDirectTradesQuery,
} = postApi;
