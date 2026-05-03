import { Request, Response } from "express"
import type { z } from "zod"
import {
    userIdParamSchema,
    userStickerParamsSchema,
} from "../../shared/validation/common"
import {
    collectionItemAddRequestSchema,
    collectionItemUpdateQuantityRequestSchema,
    missingStickerAddRequestSchema,
} from "./collection.schemas"
import CollectionService from "./collection.service"

type AddItemBody = z.infer<typeof collectionItemAddRequestSchema>
type UpdateQuantityBody = z.infer<typeof collectionItemUpdateQuantityRequestSchema>
type MissingStickerBody = z.infer<typeof missingStickerAddRequestSchema>
type UserParams = z.infer<typeof userIdParamSchema>
type UserStickerParams = z.infer<typeof userStickerParamsSchema>

export default class CollectionController {

    // GET /users/:userId/collection
    getCollection = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const collection = await CollectionService.getCollection(userId)
        return res.status(200).json(collection)
    }

    // POST /users/:userId/collection/items
    addCollectionItem = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const itemData = req.body as AddItemBody

        const newItem = await CollectionService.addCollectionItem(userId, itemData)
        return res.status(201).json(newItem)
    }

    // PATCH /users/:userId/collection/items/:stickerId
    updateCollectionItemQuantity = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params as UserStickerParams
        const { quantity } = req.body as UpdateQuantityBody

        const updatedItem = await CollectionService.updateCollectionItemQuantity(userId, stickerId, quantity)
        return res.status(200).json(updatedItem)
    }

    // DELETE /users/:userId/collection/items/:stickerId
    removeCollectionItem = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params as UserStickerParams

        await CollectionService.removeCollectionItem(userId, stickerId)
        return res.status(204).send()
    }

    // POST /users/:userId/collection/missing
    addMissingSticker = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const { stickerId } = req.body as MissingStickerBody

        const missingSticker = await CollectionService.addMissingSticker(userId, String(stickerId))
        return res.status(201).json(missingSticker)
    }

    // DELETE /users/:userId/collection/missing/:stickerId
    removeMissingSticker = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params as UserStickerParams

        await CollectionService.removeMissingSticker(userId, stickerId)
        return res.status(204).send()
    }
}
