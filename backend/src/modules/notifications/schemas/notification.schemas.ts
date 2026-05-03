import { z } from "zod"
import { NotificationType } from "../enums/notification-type.enum"
import { booleanQuery, isoDateTime, nonEmptyString, nonNegativeInt } from "../../../shared/validation/common"

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
})

export const notificationResponseSchema = z.object({
    id: nonEmptyString,
    userId: nonEmptyString,
    type: notificationTypeEnum,
    message: z.string(),
    read: z.boolean(),
    payload: z.record(z.string(), z.unknown()),
    createdAt: isoDateTime,
}).meta({ id: "Notification" })

export const unreadCountResponseSchema = z.object({
    count: nonNegativeInt,
}).meta({ id: "UnreadCount" })

export const markAllReadResponseSchema = z.object({
    marked: nonNegativeInt,
}).meta({ id: "MarkAllRead" })
