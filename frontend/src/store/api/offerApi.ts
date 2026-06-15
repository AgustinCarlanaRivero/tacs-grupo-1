import { baseApi } from "./baseApi";

export type OfferState = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface OfferItem {
  stickerId: number;
  quantity: number;
}

export interface OfferOfferer {
  id: string;
  username: string;
}

export interface OfferStickerDTO {
  number: number;
  type: "REGULAR" | "SHINY";
  player: {
    name: string;
    nationalTeam?: { name: string } | null;
    club?: { name: string } | null;
    image: string;
  };
}

export interface OfferCollectionItem {
  sticker: OfferStickerDTO;
  quantity: number;
}

export interface OfferDTO {
  id: string;
  state: OfferState;
  createdAt: string;
  offerer: OfferOfferer;
  offered: OfferCollectionItem[];
  postId: string;
  postOwnerId: string;
}

export type OfferRole = "sent" | "received" | "all";

type GetOffersByUserArgs = {
  userId: string;
  role?: OfferRole;
};

type GetOffersByPostArgs = {
  userId: string;
  postId: string;
};

type CreateOfferArgs = {
  userId: string;
  postId: string;
  offered: OfferItem[];
};

type UpdateOfferStateArgs = {
  userId: string;
  postId: string;
  offerId: string;
  state: "APPROVED" | "REJECTED" | "CANCELLED";
};

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export const offerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOffersByUser: builder.query<OfferDTO[], GetOffersByUserArgs>({
      query: ({ userId, role = "sent" }) => `/users/${userId}/offers?role=${role}`,
      transformResponse: (response: PaginatedResponse<OfferDTO>) => response.data,
      providesTags: ["Offers"],
    }),
    getOffersByPost: builder.query<OfferDTO[], GetOffersByPostArgs>({
      query: ({ userId, postId }) => `/users/${userId}/posts/${postId}/offers`,
      transformResponse: (response: PaginatedResponse<OfferDTO>) => response.data,
      providesTags: ["Offers"],
    }),
    createOffer: builder.mutation<OfferDTO, CreateOfferArgs>({
      query: ({ userId, postId, offered }) => ({
        url: `/users/${userId}/posts/${postId}/offers`,
        method: "POST",
        body: { offered },
      }),
      invalidatesTags: ["Offers"],
    }),
    updateOfferState: builder.mutation<OfferDTO, UpdateOfferStateArgs>({
      query: ({ userId, postId, offerId, state }) => ({
        url: `/users/${userId}/posts/${postId}/offers/${offerId}/state`,
        method: "PATCH",
        body: { state },
      }),
      invalidatesTags: ["Offers", "Posts"],
    }),
  }),
});

export const {
  useGetOffersByUserQuery,
  useGetOffersByPostQuery,
  useCreateOfferMutation,
  useUpdateOfferStateMutation,
} = offerApi;
