import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import CollectionService from "../../modules/collection/collection.service"
import collectionRepository from "../../modules/collection/collection.repository"
import { Sticker } from "../../modules/stickers/sticker.entity"
import { Player } from "../../modules/stickers/player.entity"
import { Category } from "../../modules/stickers/category.entity"
import { NationalTeam } from "../../modules/stickers/national-team.entity"
import { Club } from "../../modules/stickers/club.entity"

// Mock StickerService
jest.mock("../../modules/stickers/sticker.service")
import StickerService from "../../modules/stickers/sticker.service"

describe("CollectionService", () => {
    beforeEach(() => {
        collectionRepository.clear()
        jest.clearAllMocks()
    })

    // Test data
    const createTestSticker = (id: number, playerName: string = "Test Player") => {
        const nationalTeam = new NationalTeam("Argentina")
        const club = new Club("Boca Juniors")
        const player = new Player(playerName, nationalTeam, club)
        const category = new Category("NEW", "REGULAR")
        return new Sticker(id, player, category)
    }

    describe("getCollection", () => {
        it("returns empty collection for user without collection", async () => {
            const collection = await CollectionService.getCollection("user1")
            expect(collection.items).toHaveLength(0)
            expect(collection.missingStickers).toHaveLength(0)
        })

        it("returns existing collection for user", async () => {
            const sticker = createTestSticker(1)
            await collectionRepository.addCollectionItem("user1", { sticker, quantity: 2 })

            const collection = await CollectionService.getCollection("user1")
            expect(collection.items).toHaveLength(1)
            expect(collection.items[0].sticker.number).toBe(1)
            expect(collection.items[0].quantity).toBe(2)
        })
    })

    describe("addCollectionItem", () => {
        it("adds item to new collection", async () => {
            const sticker = createTestSticker(1)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            const result = await CollectionService.addCollectionItem("user1", { stickerId: 1, quantity: 3 })

            expect(result.stickerId).toBe(1)
            expect(result.quantity).toBe(3)
            expect(StickerService.getStickerByIdOrFail).toHaveBeenCalledWith("1")

            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.items).toHaveLength(1)
        })

        it("adds item to existing collection", async () => {
            const sticker1 = createTestSticker(1)
            const sticker2 = createTestSticker(2)
            await collectionRepository.addCollectionItem("user1", { sticker: sticker1, quantity: 1 })
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker2)

            await CollectionService.addCollectionItem("user1", { stickerId: 2, quantity: 2 })

            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.items).toHaveLength(2)
        })

        it("throws error when sticker not found", async () => {
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockRejectedValue(new Error("Sticker not found"))

            await expect(CollectionService.addCollectionItem("user1", { stickerId: 999 })).rejects.toThrow("Sticker not found")
        })
    })

    describe("updateCollectionItemQuantity", () => {
        it("updates quantity of existing item", async () => {
            const sticker = createTestSticker(1)
            await collectionRepository.addCollectionItem("user1", { sticker, quantity: 1 })
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            const result = await CollectionService.updateCollectionItemQuantity("user1", "1", 5)

            expect(result.stickerId).toBe(1)
            expect(result.quantity).toBe(5)
            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.items[0].quantity).toBe(5)
        })

        it("throws error for negative quantity", async () => {
            await expect(CollectionService.updateCollectionItemQuantity("user1", "1", -1)).rejects.toThrow("Quantity cannot be negative")
        })

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            await expect(CollectionService.updateCollectionItemQuantity("user1", "1", 2)).rejects.toThrow("User user1 not found or collection not initialized")
        })
    })

    describe("removeCollectionItem", () => {
        it("removes item from collection", async () => {
            const sticker = createTestSticker(1)
            await collectionRepository.addCollectionItem("user1", { sticker, quantity: 1 })
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            await CollectionService.removeCollectionItem("user1", "1")

            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.items).toHaveLength(0)
        })

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            await expect(CollectionService.removeCollectionItem("user1", "1")).rejects.toThrow("User user1 not found or collection not initialized")
        })
    })

    describe("addMissingSticker", () => {
        it("adds sticker to missing list", async () => {
            const sticker = createTestSticker(1)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            const result = await CollectionService.addMissingSticker("user1", "1")

            expect(result.stickerId).toBe(1)
            expect(result.sticker).toBe(sticker)
            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.missingStickers).toHaveLength(1)
        })

        it("throws error when sticker not found", async () => {
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockRejectedValue(new Error("Sticker not found"))

            await expect(CollectionService.addMissingSticker("user1", "999")).rejects.toThrow("Sticker not found")
        })
    })

    describe("removeMissingSticker", () => {
        it("removes sticker from missing list", async () => {
            const sticker = createTestSticker(1)
            await collectionRepository.addMissingSticker("user1", sticker)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            await CollectionService.removeMissingSticker("user1", "1")

            const collection = await collectionRepository.getCollection("user1")
            expect(collection?.missingStickers).toHaveLength(0)
        })

        it("throws error when collection not found", async () => {
            const sticker = createTestSticker(1)
            ;(StickerService.getStickerByIdOrFail as jest.Mock).mockResolvedValue(sticker)

            await expect(CollectionService.removeMissingSticker("user1", "1")).rejects.toThrow("User user1 not found or collection not initialized")
        })
    })
})