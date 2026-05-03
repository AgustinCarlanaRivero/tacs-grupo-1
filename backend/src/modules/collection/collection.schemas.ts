import { z } from "zod"
import { stickerResponseSchema } from "../stickers/sticker.schemas"
import { nonNegativeInt, positiveInt } from "../../shared/validation/common"

/** POST /users/:userId/collection/items */
export const collectionItemAddRequestSchema = z.object({
    stickerId: positiveInt,
    quantity: positiveInt.default(1),
}).meta({ id: "CollectionItemAddRequest" })

/** PATCH /users/:userId/collection/items/:stickerId */
export const collectionItemUpdateQuantityRequestSchema = z.object({
    quantity: nonNegativeInt,
}).meta({ id: "CollectionItemUpdateQuantityRequest" })

/** POST /users/:userId/collection/missing */
export const missingStickerAddRequestSchema = z.object({
    stickerId: positiveInt,
}).meta({ id: "MissingStickerAddRequest" })

export const collectionItemResponseSchema = z.object({
    sticker: stickerResponseSchema,
    quantity: nonNegativeInt,
}).meta({ id: "CollectionItem" })

export const collectionResponseSchema = z.object({
    items: z.array(collectionItemResponseSchema),
    missingStickers: z.array(stickerResponseSchema),
}).meta({ id: "Collection" })
