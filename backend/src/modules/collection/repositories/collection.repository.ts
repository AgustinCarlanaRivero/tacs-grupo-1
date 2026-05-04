import { Collection } from "../entities/collection.entity"
import { CollectionItem } from "../entities/collection-item.interface"
import { Sticker } from "../../stickers/entities/sticker.entity"

/**
 * Repositorio in-memory de colecciones. Mantiene un índice por userId.
 * Pensado para reemplazar por una implementación persistente (Mongo)
 * en próximas entregas.
 */
class CollectionRepository {
    private collections: Map<string, Collection> = new Map()

    async getCollection(userId: string): Promise<Collection | null> {
        return this.collections.get(userId) || null
    }

    async addCollectionItem(userId: string, collectionItem: CollectionItem): Promise<Collection | null> {
        let collection = this.collections.get(userId)
        if (!collection) {
            collection = new Collection()
        }
        collection.addItem(collectionItem)
        this.collections.set(userId, collection)
        return collection
    }

    async updateCollectionItemQuantity(userId: string, stickerId: number, quantity: number): Promise<Collection | null> {
        const collection = this.collections.get(userId)
        if (!collection) return null
        collection.updateItemQuantity(stickerId, quantity)
        return collection
    }

    async removeCollectionItem(userId: string, stickerId: number): Promise<Collection | null> {
        const collection = this.collections.get(userId)
        if (!collection) return null
        collection.removeItem(stickerId)
        return collection
    }

    async addMissingSticker(userId: string, sticker: Sticker): Promise<Collection | null> {
        let collection = this.collections.get(userId)
        if (!collection) {
            collection = new Collection()
        }
        collection.addMissing(sticker)
        this.collections.set(userId, collection)
        return collection
    }

    async removeMissingSticker(userId: string, stickerId: number): Promise<Collection | null> {
        const collection = this.collections.get(userId)
        if (!collection) return null
        collection.removeMissing(stickerId)
        return collection
    }

    async initializeCollection(userId: string): Promise<Collection> {
        const collection = new Collection()
        this.collections.set(userId, collection)
        return collection
    }

    /**
     * Vacía el índice. Sólo se usa en tests para aislar casos.
     */
    clear(): void {
        this.collections.clear()
    }
}

export default new CollectionRepository()