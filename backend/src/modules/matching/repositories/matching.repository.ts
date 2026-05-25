import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { UserModel } from "../../users/schemas/user.model";

class MatchingRepository {
    updateUserIndex(_user: User): void {
        // No-op: MongoDB maintains indexes automatically.
    }

    async getUsersBySticker(stickerId: number): Promise<string[]> {
        const users = await UserModel.find({
            "collection.items.sticker.number": stickerId,
        })
            .select("_id")
            .exec();

        return users.map((user) => String(user._id));
    }

    async getUserMissingStickers(userId: string): Promise<Set<number>> {
        const user = await UserModel.findById(userId)
            .select("collection.missingStickers")
            .exec();

        if (!user?.collection?.missingStickers) return new Set();
        return new Set(
            user.collection.missingStickers.map((s: Sticker) => s.number),
        );
    }

    clear(): void {
        // No-op: MongoDB queries use live data.
    }

    getStats(): { totalIndexedStickers: number; totalIndexedUsers: number } {
        return { totalIndexedStickers: 0, totalIndexedUsers: 0 };
    }
}

export default new MatchingRepository();
