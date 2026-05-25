import { Sticker } from "../../stickers/entities/sticker.entity";
import { UserModel } from "../../users/schemas/user.model";
import { CollectionItem } from "../entities/collection-item.interface";
import { Collection } from "../entities/collection.entity";

class CollectionRepository {
    private async loadUser(userId: string) {
        return UserModel.findById(userId).select("collection").exec();
    }

    async getCollection(userId: string): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        return user?.collection ?? null;
    }

    async addCollectionItem(
        userId: string,
        collectionItem: CollectionItem,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user) return null;

        const collection = user.collection ?? new Collection();
        collection.addItem(collectionItem);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();

        return collection;
    }

    async updateCollectionItemQuantity(
        userId: string,
        stickerId: number,
        quantity: number,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user || !user.collection) return null;

        user.collection.updateItemQuantity(stickerId, quantity);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection: user.collection } },
        ).exec();

        return user.collection;
    }

    async removeCollectionItem(
        userId: string,
        stickerId: number,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user || !user.collection) return null;

        user.collection.removeItem(stickerId);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection: user.collection } },
        ).exec();

        return user.collection;
    }

    async addMissingSticker(
        userId: string,
        sticker: Sticker,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user) return null;

        const collection = user.collection ?? new Collection();
        collection.addMissing(sticker);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();

        return collection;
    }

    async removeMissingSticker(
        userId: string,
        stickerId: number,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user || !user.collection) return null;

        user.collection.removeMissing(stickerId);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection: user.collection } },
        ).exec();

        return user.collection;
    }

    async initializeCollection(userId: string): Promise<Collection> {
        const collection = new Collection();
        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();
        return collection;
    }

    /**
     * Vacía el índice. Sólo se usa en tests para aislar casos.
     */
    async clear(): Promise<void> {
        await UserModel.updateMany({}, { $set: { collection: null } }).exec();
    }
}

export default new CollectionRepository();
