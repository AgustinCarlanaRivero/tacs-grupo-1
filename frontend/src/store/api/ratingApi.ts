import { baseApi } from "./baseApi";

export interface RatingDTO {
  id: string;
  reviewerId: string;
  revieweeId: string;
  score: number;
  comment: string;
  createdAt: string;
}

type CreateRatingArgs = {
  userId: string;
  score: number;
  comment?: string;
};

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export const ratingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRatingsByUser: builder.query<RatingDTO[], string>({
      query: (userId: string) => `/users/${userId}/ratings`,
      transformResponse: (response: PaginatedResponse<RatingDTO>) => response.data,
      providesTags: ["Users"],
    }),
    createRating: builder.mutation<RatingDTO, CreateRatingArgs>({
      query: ({ userId, score, comment }) => ({
        url: `/users/${userId}/ratings`,
        method: "POST",
        body: { score, comment },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetRatingsByUserQuery, useCreateRatingMutation } = ratingApi;
