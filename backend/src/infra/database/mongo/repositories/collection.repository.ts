import { Collection } from "../../../../modules/collection/collection.entity"
import { CollectionItem } from "../../../../modules/collection/collection-item.interface"
import { Sticker } from "../../../../modules/stickers/sticker.entity"

export class CollectionRepository {
    static async getCollection(userId: string): Promise<Collection | null> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }

    static async addCollectionItem(userId: string, collectionItem: CollectionItem): Promise<Collection | null> {
        // TODO: Implementar inserción en BD
        throw new Error("Not implemented")
    }

    static async updateCollectionItemQuantity(userId: string, stickerId: number, quantity: number): Promise<Collection | null> {
        // TODO: Implementar actualización en BD
        throw new Error("Not implemented")
    }

    static async removeCollectionItem(userId: string, stickerId: number): Promise<Collection | null> {
        // TODO: Implementar eliminación en BD
        throw new Error("Not implemented")
    }

    static async addMissingSticker(userId: string, sticker: Sticker): Promise<Collection | null> {
        // TODO: Implementar inserción en BD
        throw new Error("Not implemented")
    }

    static async removeMissingSticker(userId: string, stickerId: number): Promise<Collection | null> {
        // TODO: Implementar eliminación en BD
        throw new Error("Not implemented")
    }

    static async initializeCollection(userId: string): Promise<Collection> {
        // TODO: Implementar inicialización en BD
        throw new Error("Not implemented")
    }
}