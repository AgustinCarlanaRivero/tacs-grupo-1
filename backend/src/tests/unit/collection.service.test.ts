import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import { Collection } from "../../modules/collection/entities/collection.entity";
import collectionRepository from "../../modules/collection/repositories/collection.repository";
import CollectionService from "../../modules/collection/services/collection.service";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import StickerService from "../../modules/stickers/services/sticker.service";

const mockCollectionsByUser = new Map<string, Collection>();

const mockCreateCollection = (): Collection => new Collection();

// Mock CollectionRepository
jest.mock("../../modules/collection/repositories/collection.repository", () => ({
    __esModule: true,
    default: {
        clear: jest.fn(async () => mockCollectionsByUser.clear()),
        getCollection: jest.fn(
            async (userId: string) => mockCollectionsByUser.get(userId) ?? null,
        ),
        addCollectionItem: jest.fn(
            async (userId: string, item: CollectionItem) => {
                const collection =
                    mockCollectionsByUser.get(userId) ?? mockCreateCollection();
                mockCollectionsByUser.set(userId, collection);
                collection.addItem(item);
                return collection;
            },
        ),
        updateCollectionItemQuantity: jest.fn(
            async (userId: string, stickerId: number, quantity: number) => {
                const collection = mockCollectionsByUser.get(userId);
                if (!collection) return null;
                collection.updateItemQuantity(stickerId, quantity);
                return collection;
            },
        ),
        removeCollectionItem: jest.fn(
            async (userId: string, stickerId: number) => {
                const collection = mockCollectionsByUser.get(userId);
                if (!collection) return null;
                collection.removeItem(stickerId);
                return collection;
            },
        ),
        addMissingSticker: jest.fn(async (userId: string, sticker: Sticker) => {
            const collection =
                mockCollectionsByUser.get(userId) ?? mockCreateCollection();
            mockCollectionsByUser.set(userId, collection);
            collection.addMissing(sticker);
            return collection;
        }),
        removeMissingSticker: jest.fn(
            async (userId: string, stickerId: number) => {
                const collection = mockCollectionsByUser.get(userId);
                if (!collection) return null;
                collection.removeMissing(stickerId);
                return collection;
            },
        ),
    },
}));

// Mock StickerService
jest.mock("../../modules/stickers/services/sticker.service");

describe("CollectionService", () => {
    beforeEach(async () => {
        await collectionRepository.clear();
        jest.clearAllMocks();
    });

    // Test data
    const createTestSticker = (
        id: number,
        playerName: string = "Test Player",
    ) => {
        const nationalTeam = new NationalTeam("Argentina");
        const club = new Club("Boca Juniors");
        const player = new Player(playerName, nationalTeam, club);
        return new Sticker(id, player, "NEW", "REGULAR");
    };

    const createAddItemPayload = (sticker: Sticker, quantity: number = 1) => ({
        sticker: {
            number: sticker.number,
            player: {
                name: sticker.player.name,
                nationalTeam: sticker.player.nationalTeam
                    ? { name: sticker.player.nationalTeam.name }
                    : null,
                club: sticker.player.club
                    ? { name: sticker.player.club.name }
                    : null,
                image: sticker.player.image || null,
            },
            type: sticker.type,
        },
        quantity,
    });

    describe("getCollection", () => {
        it("returns empty collection for user without collection", async () => {
            const collection = await CollectionService.getCollection("user1");
            expect(collection.items).toHaveLength(0);
            expect(collection.missingStickers).toHaveLength(0);
        });

        it("returns existing collection for user", async () => {
            const sticker = createTestSticker(1);
            await collectionRepository.addCollectionItem("user1", {
                sticker,
                quantity: 2,
            });

            const collection = await CollectionService.getCollection("user1");
            expect(collection.items).toHaveLength(1);
            expect(collection.items[0].sticker.number).toBe(1);
            expect(collection.items[0].quantity).toBe(2);
        });
    });

    describe("addCollectionItem", () => {
        it("adds item to new collection", async () => {
            const sticker = createTestSticker(1);

            const result = await CollectionService.addCollectionItem(
                "user1",
                createAddItemPayload(sticker, 3),
            );

            expect(result.sticker.number).toBe(1);
            expect(result.quantity).toBe(3);
            expect(
                StickerService.getStickerByNumberOrFail,
            ).not.toHaveBeenCalled();

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.items).toHaveLength(1);
        });

        it("adds item to existing collection", async () => {
            const sticker1 = createTestSticker(1);
            const sticker2 = createTestSticker(2);
            await collectionRepository.addCollectionItem("user1", {
                sticker: sticker1,
                quantity: 1,
            });

            await CollectionService.addCollectionItem(
                "user1",
                createAddItemPayload(sticker2, 2),
            );

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.items).toHaveLength(2);
        });

        it("persists received sticker data", async () => {
            const sticker = createTestSticker(999, "Request Player");
            sticker.type = "SHINY";

            await CollectionService.addCollectionItem(
                "user1",
                createAddItemPayload(sticker),
            );

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.items[0].sticker.number).toBe(999);
            expect(collection?.items[0].sticker.player.name).toBe(
                "Request Player",
            );
            expect(collection?.items[0].sticker.type).toBe("SHINY");
        });
    });

    describe("updateCollectionItemQuantity", () => {
        it("updates quantity of existing item", async () => {
            const sticker = createTestSticker(1);
            await collectionRepository.addCollectionItem("user1", {
                sticker,
                quantity: 1,
            });
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            const result = await CollectionService.updateCollectionItemQuantity(
                "user1",
                "1",
                5,
            );

            expect(result.stickerId).toBe(1);
            expect(result.quantity).toBe(5);
            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.items[0].quantity).toBe(5);
        });

        it("throws error for negative quantity", async () => {
            await expect(
                CollectionService.updateCollectionItemQuantity(
                    "user1",
                    "1",
                    -1,
                ),
            ).rejects.toThrow("Quantity cannot be negative");
        });

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1);
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            await expect(
                CollectionService.updateCollectionItemQuantity("user1", "1", 2),
            ).rejects.toThrow(
                "User user1 not found or collection not initialized",
            );
        });
    });

    describe("removeCollectionItem", () => {
        it("removes item from collection", async () => {
            const sticker = createTestSticker(1);
            await collectionRepository.addCollectionItem("user1", {
                sticker,
                quantity: 1,
            });
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            await CollectionService.removeCollectionItem("user1", "1");

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.items).toHaveLength(0);
        });

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1);
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            await expect(
                CollectionService.removeCollectionItem("user1", "1"),
            ).rejects.toThrow(
                "User user1 not found or collection not initialized",
            );
        });
    });

    describe("addMissingSticker", () => {
        it("adds sticker to missing list", async () => {
            const sticker = createTestSticker(1);

            const result = await CollectionService.addMissingSticker(
                "user1",
                createAddItemPayload(sticker),
            );

            expect(result.number).toBe(1);
            expect(
                StickerService.getStickerByNumberOrFail,
            ).not.toHaveBeenCalled();
            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.missingStickers).toHaveLength(1);
        });

        it("persists received missing sticker data", async () => {
            const sticker = createTestSticker(999, "Missing Player");
            sticker.type = "SHINY";

            await CollectionService.addMissingSticker(
                "user1",
                createAddItemPayload(sticker),
            );

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.missingStickers[0].number).toBe(999);
            expect(collection?.missingStickers[0].player.name).toBe(
                "Missing Player",
            );
            expect(collection?.missingStickers[0].type).toBe("SHINY");
        });
    });

    describe("removeMissingSticker", () => {
        it("removes sticker from missing list", async () => {
            const sticker = createTestSticker(1);
            await collectionRepository.addMissingSticker("user1", sticker);
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            await CollectionService.removeMissingSticker("user1", "1");

            const collection =
                await collectionRepository.getCollection("user1");
            expect(collection?.missingStickers).toHaveLength(0);
        });

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1);
            jest.mocked(
                StickerService.getStickerByNumberOrFail,
            ).mockResolvedValue(sticker);

            await expect(
                CollectionService.removeMissingSticker("user1", "1"),
            ).rejects.toThrow(
                "User user1 not found or collection not initialized",
            );
        });
    });
});
