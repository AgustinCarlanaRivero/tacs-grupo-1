import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "../tokenStore";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    prepareHeaders: async (headers) => {
      const token = await getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "Collection",
    "Stickers",
    "Posts",
    "Offers",
    "Admin",
    "Notifications",
    "Templates",
  ],

  endpoints: () => ({}),
});
