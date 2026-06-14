import type { FilterQuery, HydratedDocument, PipelineStage } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import {
    createObjectIdString,
    toIdString,
    toObjectId,
    type PersistenceId,
} from "../../../infra/database/schema-helpers";
import type { Collection } from "../../collection/entities/collection.entity";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";
import { UserModel } from "../schemas/user.model";

type UserPersistence = {
    _id: PersistenceId;
    auth0Sub?: string;
    telegramChatId?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: UserRole;
    reputation: number;
    collection: Collection | null;
};

type UserCollectionStickerLookup = {
    collection?: {
        items?: Array<{ sticker: Sticker }>;
        missingStickers?: Sticker[];
    } | null;
};

type StickerFilters = {
    state?: string;
    type?: string;
    team?: string;
    club?: string;
    query?: string;
};

const buildStickerFilter = (
    filters: StickerFilters = {},
): Record<string, unknown> => {
    const filter: Record<string, unknown> = {};

    if (filters.state) {
        filter.state = filters.state;
    }
    if (filters.type) {
        filter.type = filters.type;
    }
    if (filters.team) {
        filter["player.nationalTeam.name"] = filters.team;
    }
    if (filters.club) {
        filter["player.club.name"] = filters.club;
    }

    if (filters.query) {
        const regex = new RegExp(filters.query, "i");
        const orFilters: Record<string, unknown>[] = [
            { description: regex },
            { "player.name": regex },
            { "player.nationalTeam.name": regex },
            { "player.club.name": regex },
        ];

        const numericQuery = Number(filters.query);
        if (!Number.isNaN(numericQuery)) {
            orFilters.push({ number: numericQuery });
        }

        filter.$or = orFilters;
    }

    return filter;
};

class UserRepository extends BaseRepository<UserPersistence, User> {
    constructor() {
        super(UserModel);
    }

    protected toEntity(doc: HydratedDocument<UserPersistence>): User {
        const collection = doc.get("collection") as Collection | null;
        const user = new User(
            doc.firstName,
            doc.lastName,
            doc.username,
            doc.email,
            doc.role,
            doc.reputation,
            collection ?? null,
            toIdString(doc._id),
        );

        user.auth0Sub = doc.auth0Sub ?? "";
        user.telegramChatId = doc.telegramChatId ?? undefined;
        return user;
    }

    protected toPersistence(
        user: User,
    ): Partial<UserPersistence> & { _id?: PersistenceId } {
        const id = user.id || createObjectIdString();
        if (!user.id) {
            user.setId(id);
        }

        return {
            _id: toObjectId(id),
            auth0Sub: user.auth0Sub || undefined,
            telegramChatId: user.telegramChatId || undefined,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
            collection: user.collection ?? null,
        };
    }

    async findByAuth0Sub(sub: string): Promise<User | null> {
        const doc = await UserModel.findOne({
            auth0Sub: sub,
        } as FilterQuery<UserPersistence>)
            .select("+auth0Sub")
            .exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findById(id: string): Promise<User | null> {
        return super.findById(id);
    }

    async findAll(): Promise<User[]> {
        return this.findMany();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ email } as FilterQuery<UserPersistence>);
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findOne({ username } as FilterQuery<UserPersistence>);
    }

    async findByTelegramChatId(chatId: string): Promise<User | null> {
        return this.findOne({ telegramChatId: chatId } as FilterQuery<UserPersistence>);
    }

    /**
     * Reconstruye una instancia de `Sticker` a partir del documento plano que
     * devuelve `.lean()`, para que el dominio recupere sus métodos (p. ej.
     * `getDisplayName()`).
     */
    private toStickerEntity(doc: Sticker): Sticker {
        return new Sticker(
            doc.number,
            doc.player,
            doc.state,
            doc.type,
            doc.description,
        );
    }

    async findStickerByNumber(stickerNumber: number): Promise<Sticker | null> {
        const fromItems = await UserModel.findOne(
            {
                "collection.items.sticker.number": stickerNumber,
            } as FilterQuery<UserPersistence>,
            {
                "collection.items.$": 1,
            },
        )
            .lean<UserCollectionStickerLookup>()
            .exec();

        const itemSticker = fromItems?.collection?.items?.[0]?.sticker;
        if (itemSticker) {
            return this.toStickerEntity(itemSticker);
        }

        const fromMissing = await UserModel.findOne(
            {
                "collection.missingStickers.number": stickerNumber,
            } as FilterQuery<UserPersistence>,
            {
                "collection.missingStickers.$": 1,
            },
        )
            .lean<UserCollectionStickerLookup>()
            .exec();

        const missingSticker = fromMissing?.collection?.missingStickers?.[0];
        return missingSticker ? this.toStickerEntity(missingSticker) : null;
    }

    async findStickersByFilters(filters: StickerFilters = {}): Promise<Sticker[]> {
        const stickerFilter = buildStickerFilter(filters);
        const hasFilters = Object.keys(stickerFilter).length > 0;

        const pipeline: PipelineStage[] = [];

        if (hasFilters) {
            const itemMatch: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(stickerFilter)) {
                if (key === "$or") {
                    itemMatch.$or = (
                        value as Record<string, unknown>[]
                    ).map((cond) => {
                        const newCond: Record<string, unknown> = {};
                        for (const [k, v] of Object.entries(cond)) {
                            newCond[`sticker.${k}`] = v;
                        }
                        return newCond;
                    });
                } else {
                    itemMatch[`sticker.${key}`] = value;
                }
            }

            pipeline.push({
                $match: {
                    $or: [
                        { "collection.items": { $elemMatch: itemMatch } },
                        {
                            "collection.missingStickers": {
                                $elemMatch: stickerFilter,
                            },
                        },
                    ],
                },
            });
        }

        pipeline.push({
            $project: {
                allStickers: {
                    $concatArrays: [
                        {
                            $map: {
                                input: { $ifNull: ["$collection.items", []] },
                                as: "item",
                                in: "$$item.sticker",
                            },
                        },
                        { $ifNull: ["$collection.missingStickers", []] },
                    ],
                },
            },
        });

        pipeline.push({ $unwind: "$allStickers" });

        if (hasFilters) {
            const finalMatch: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(stickerFilter)) {
                if (key === "$or") {
                    finalMatch.$or = (
                        value as Record<string, unknown>[]
                    ).map((cond) => {
                        const newCond: Record<string, unknown> = {};
                        for (const [k, v] of Object.entries(cond)) {
                            newCond[`allStickers.${k}`] = v;
                        }
                        return newCond;
                    });
                } else {
                    finalMatch[`allStickers.${key}`] = value;
                }
            }
            pipeline.push({ $match: finalMatch });
        }

        pipeline.push({
            $group: {
                _id: "$allStickers.number",
                sticker: { $first: "$allStickers" },
            },
        });

        pipeline.push({ $replaceRoot: { newRoot: "$sticker" } });

        return await UserModel.aggregate(pipeline).exec();
    }

    async getStickerPlayers(): Promise<string[]> {
        const itemsPlayers = await UserModel.distinct(
            "collection.items.sticker.player.name",
        ).exec();
        const missingPlayers = await UserModel.distinct(
            "collection.missingStickers.player.name",
        ).exec();

        return Array.from(new Set([...itemsPlayers, ...missingPlayers]))
            .filter((v): v is string => typeof v === "string")
            .sort();
    }

    async getStickerTeams(): Promise<string[]> {
        const itemsTeams = await UserModel.distinct(
            "collection.items.sticker.player.nationalTeam.name",
        ).exec();
        const missingTeams = await UserModel.distinct(
            "collection.missingStickers.player.nationalTeam.name",
        ).exec();

        return Array.from(new Set([...itemsTeams, ...missingTeams]))
            .filter((v): v is string => typeof v === "string")
            .sort();
    }

    async getStickerClubs(): Promise<string[]> {
        const itemsClubs = await UserModel.distinct(
            "collection.items.sticker.player.club.name",
        ).exec();
        const missingClubs = await UserModel.distinct(
            "collection.missingStickers.player.club.name",
        ).exec();

        return Array.from(new Set([...itemsClubs, ...missingClubs]))
            .filter((v): v is string => typeof v === "string")
            .sort();
    }

    async save(user: User): Promise<User> {
        return super.save(user);
    }

    async delete(id: string): Promise<boolean> {
        return this.deleteById(id);
    }

    /**
     * Vacia los indices. Solo se usa en tests para aislar casos.
     */
    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<UserPersistence>);
    }
}


export default new UserRepository();

