import { baseApi } from "./baseApi";

export interface InternalUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "STANDARD" | "ADMIN";
  reputation: number;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<InternalUser, void>({
      query: () => "/auth/me",
      providesTags: ["Users"],
    }),
  }),
});

export const { useGetMeQuery } = authApi;
