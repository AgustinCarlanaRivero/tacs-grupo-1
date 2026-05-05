import { z } from "zod"
import { NotificationType } from "../enums/notification-type.enum"
import {
    booleanQuery,
    isoDateTime,
    nonEmptyString,
    nonNegativeInt,
    queryString,
} from "../../../shared/validation/common"

export const notificationTypeEnum = z.enum([
    NotificationType.STICKER_AVAILABLE,
    NotificationType.AUCTION_ENDING,
    NotificationType.OFFER_RECEIVED,
    NotificationType.OFFER_ACCEPTED,
    NotificationType.OFFER_REJECTED,
    NotificationType.RATING_RECEIVED,
])

/** GET /users/:userId/notifications?unread=true */
export const notificationQuerySchema = z.object({
    unread: booleanQuery,
    query: queryString,
})

export const notificationResponseSchema = z.object({
    id: nonEmptyString,
    userId: nonEmptyString,
    type: notificationTypeEnum,
    message: z.string(),
    read: z.boolean(),
    payload: z.record(z.string(), z.unknown()),
    createdAt: z.union([z.date(), isoDateTime])
        .transform(v => v instanceof Date ? v.toISOString() : v),
}).meta({ id: "Notification" })

export const unreadCountResponseSchema = z.object({
    count: nonNegativeInt,
}).meta({ id: "UnreadCount" })

export const markAllReadResponseSchema = z.object({
    marked: nonNegativeInt,
}).meta({ id: "MarkAllRead" })

export type NotificationResponseDto = z.infer<typeof notificationResponseSchema>
export type UnreadCountResponseDto  = z.infer<typeof unreadCountResponseSchema>
export type MarkAllReadResponseDto  = z.infer<typeof markAllReadResponseSchema>
