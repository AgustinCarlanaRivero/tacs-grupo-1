export default class CollectionService {
    static async getCollection(_userId: string) {
        return {}
    }

    static async addCollectionItem(_userId: string, _itemData: unknown) {
        return {}
    }

    static async updateCollectionItemQuantity(_userId: string, _stickerId: string, _quantity: unknown) {
        return {}
    }

    static async removeCollectionItem(_userId: string, _stickerId: string) {
        return
    }

    static async addMissingSticker(_userId: string, _stickerId: string) {
        return {}
    }

    static async removeMissingSticker(_userId: string, _stickerId: string) {
        return
    }
}
