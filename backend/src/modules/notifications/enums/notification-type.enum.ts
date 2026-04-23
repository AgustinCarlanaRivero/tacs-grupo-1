export const NotificationType = {
    STICKER_AVAILABLE: "STICKER_AVAILABLE",
    AUCTION_ENDING: "AUCTION_ENDING",
    OFFER_RECEIVED: "OFFER_RECEIVED",
    OFFER_ACCEPTED: "OFFER_ACCEPTED",
    OFFER_REJECTED: "OFFER_REJECTED",
    RATING_RECEIVED: "RATING_RECEIVED",
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]
