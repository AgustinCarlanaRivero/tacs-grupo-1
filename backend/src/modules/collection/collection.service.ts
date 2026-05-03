import { Collection } from "../collection/collection.entity"
import { CollectionItem } from "../collection/collection-item.interface"
import StickerService from "../stickers/sticker.service"
import collectionRepository from "./collection.repository"

export default class CollectionService {
    /**
     * GET /users/:userId/collection
     * Obtiene toda la coleccion del usuario
     */
    static async getCollection(userId: string) {
        const collection = await collectionRepository.getCollection(userId)
        return collection || new Collection()
    }

    /**
     * POST /users/:userId/collection/items
     * Agregar una figurita obtenida
     */
    static async addCollectionItem(userId: string, itemData: { stickerId: number; quantity?: number }) {
        const { stickerId, quantity = 1 } = itemData

        // Validar que el sticker exista
        const sticker = await StickerService.getStickerByIdOrFail(String(stickerId))

        const newItem: CollectionItem = {
            sticker,
            quantity
        }

        const collection = await collectionRepository.addCollectionItem(userId, newItem)
        if (!collection) {
            throw new Error(`User ${userId} not found`)
        }

        return { stickerId, quantity }
    }

    /**
     * PATCH /users/:userId/collection/items/:stickerId
     * Actualiza la cantidad de un item
     */
    static async updateCollectionItemQuantity(userId: string, stickerId: string, quantity: number) {
        if (quantity < 0) {
            throw new Error("Quantity cannot be negative")
        }

        const id = parseInt(stickerId, 10)
        // Validar que el sticker exista
        await StickerService.getStickerByIdOrFail(stickerId)

        const collection = await collectionRepository.updateCollectionItemQuantity(userId, id, quantity)
        if (!collection) {
            throw new Error(`User ${userId} not found or collection not initialized`)
        }

        return { stickerId: id, quantity }
    }

    /**
     * DELETE /users/:userId/collection/items/:stickerId
     * Elimina el item de la coleccion
     */
    static async removeCollectionItem(userId: string, stickerId: string) {
        const id = parseInt(stickerId, 10)
        // Validar que el sticker exista
        await StickerService.getStickerByIdOrFail(stickerId)

        const collection = await collectionRepository.removeCollectionItem(userId, id)
        if (!collection) {
            throw new Error(`User ${userId} not found or collection not initialized`)
        }
    }

    /**
     * POST /users/:userId/collection/missing
     * Agregar un Sticker a la lista de faltantes
     */
    static async addMissingSticker(userId: string, stickerId: string) {
        const id = parseInt(stickerId, 10)
        // Validar que el sticker exista
        const sticker = await StickerService.getStickerByIdOrFail(stickerId)

        const collection = await collectionRepository.addMissingSticker(userId, sticker)
        if (!collection) {
            throw new Error(`User ${userId} not found`)
        }

        return { stickerId: id, sticker }
    }

    /**
     * DELETE /users/:userId/collection/missing/:stickerId
     * Eliminar de la lista de faltantes
     */
    static async removeMissingSticker(userId: string, stickerId: string) {
        const id = parseInt(stickerId, 10)
        // Validar que el sticker exista
        await StickerService.getStickerByIdOrFail(stickerId)

        const collection = await collectionRepository.removeMissingSticker(userId, id)
        if (!collection) {
            throw new Error(`User ${userId} not found or collection not initialized`)
        }
    }
}
