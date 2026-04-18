import { Collection } from "../../../../modules/users/collection.entity.ts"
import { CollectionItem } from "../../../../modules/users/collection-item.interface.ts"
import { Sticker } from "../../../../modules/stickers/sticker.entity.ts"

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