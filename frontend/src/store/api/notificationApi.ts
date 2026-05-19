import { baseApi } from "./baseApi";

export type NotificationType =
  | "STICKER_AVAILABLE"
  | "AUCTION_ENDING"
  | "OFFER_RECEIVED"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "RATING_RECEIVED";

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export interface MarkAllReadResponse {
  marked: number;
}

/**
 * Mapea un tipo de notificación + payload a una ruta del frontend.
 * Devuelve undefined si el tipo no tiene una vista navegable.
 */
export function notificationLinkFor(
  type: NotificationType,
  _payload: Record<string, unknown>
): string | undefined {
  switch (type) {
    case "STICKER_AVAILABLE":
      return "/trades?tab=market";
    case "AUCTION_ENDING":
      return "/auctions?tab=market";
    case "OFFER_RECEIVED":
      return "/trades?tab=offers";
    case "OFFER_ACCEPTED":
    case "OFFER_REJECTED":
      return "/trades?tab=mine";
    case "RATING_RECEIVED":
      return "/profile";
    default:
      return undefined;
  }
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<NotificationDTO[], string>({
      query: (userId: string) => `/users/${userId}/notifications`,
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<UnreadCount, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<NotificationDTO, string>({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: builder.mutation<MarkAllReadResponse, void>({
      query: () => ({
        url: `/notifications/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
