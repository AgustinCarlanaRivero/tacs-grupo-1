import { baseApi } from "./baseApi";
import type { InternalUser } from "./authApi";

export interface AdminStats {
  users: {
    total: number;
    byRole: {
      standard: number;
      admin: number;
    };
    topByReputation: Array<{
      id: string;
      username: string;
      reputation: number;
    }>;
  };
  notifications: {
    total: number;
    unread: number;
    read: number;
    byType: Record<string, number>;
  };
}

export type AdminRole = "STANDARD" | "ADMIN";

export interface RoleUpdateResponse {
  id: string;
  username: string;
  role: AdminRole;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["Admin"],
    }),
    getAdminUsers: builder.query<InternalUser[], void>({
      query: () => "/admin/users",
      providesTags: ["Admin"],
    }),
    getAdminUserById: builder.query<InternalUser, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: ["Admin"],
    }),
    updateUserRole: builder.mutation<
      RoleUpdateResponse,
      { userId: string; role: AdminRole }
    >({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Admin", "Users"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateUserRoleMutation,
} = adminApi;
