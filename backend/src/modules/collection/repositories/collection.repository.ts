import { Sticker } from "../../stickers/entities/sticker.entity";
import { UserModel } from "../../users/schemas/user.model";
import { CollectionItem } from "../entities/collection-item.interface";
import { Collection } from "../entities/collection.entity";

const getUserCollection = (user: { get: (path: string) => unknown } | null) =>
    (user?.get("collection") as Collection | null) ?? null;

class CollectionRepository {
    private async loadUser(userId: string) {
        return UserModel.findById(userId).select("collection").exec();
    }

    async getCollection(userId: string): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        return getUserCollection(user);
    }

    async addCollectionItem(
        userId: string,
        collectionItem: CollectionItem,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user) return null;

        const collection = getUserCollection(user) ?? new Collection();
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
        const collection = getUserCollection(user);
        if (!user || !collection) return null;

        collection.updateItemQuantity(stickerId, quantity);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();

        return collection;
    }

    async removeCollectionItem(
        userId: string,
        stickerId: number,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        const collection = getUserCollection(user);
        if (!user || !collection) return null;

        collection.removeItem(stickerId);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();

        return collection;
    }

    async addMissingSticker(
        userId: string,
        sticker: Sticker,
    ): Promise<Collection | null> {
        const user = await this.loadUser(userId);
        if (!user) return null;

        const collection = getUserCollection(user) ?? new Collection();
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
        const collection = getUserCollection(user);
        if (!user || !collection) return null;

        collection.removeMissing(stickerId);

        await UserModel.updateOne(
            { _id: userId },
            { $set: { collection } },
        ).exec();

        return collection;
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
