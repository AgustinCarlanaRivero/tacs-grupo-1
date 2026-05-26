import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Category } from "../../modules/stickers/entities/category.entity";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import StickerService from "../../modules/stickers/services/sticker.service";

const mockStickersById = new Map<number, Sticker>();

jest.mock("../../modules/posts/repositories/post.repository", () => ({
    __esModule: true,
    default: {
        findStickersByFilters: async (filters: {
            state?: string;
            type?: string;
            team?: string;
            club?: string;
        }) =>
            Array.from(mockStickersById.values()).filter((sticker) =>
                sticker.matchesFilters(filters),
            ),
        findStickerByNumber: async (id: number) =>
            mockStickersById.get(id) ?? null,
        getStickerPlayers: async () => {
            const players = new Set<string>();
            for (const sticker of mockStickersById.values()) {
                players.add(sticker.player.name);
            }
            return Array.from(players).sort();
        },
        getStickerTeams: async () => {
            const teams = new Set<string>();
            for (const sticker of mockStickersById.values()) {
                if (sticker.player.nationalTeam) {
                    teams.add(sticker.player.nationalTeam.name);
                }
            }
            return Array.from(teams).sort();
        },
        getStickerClubs: async () => {
            const clubs = new Set<string>();
            for (const sticker of mockStickersById.values()) {
                if (sticker.player.club) {
                    clubs.add(sticker.player.club.name);
                }
            }
            return Array.from(clubs).sort();
        },
    },
}));

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: {
        findStickerInCollections: async (id: number) =>
            mockStickersById.get(id) ?? null,
    },
}));

describe("StickerService", () => {
    beforeEach(() => {
        mockStickersById.clear();
        // Setup test data
        const argentina = new NationalTeam("Argentina");
        const brazil = new NationalTeam("Brazil");
        const boca = new Club("Boca Juniors");
        const flamengo = new Club("Flamengo");

        const messi = new Player("Lionel Messi", argentina, boca);
        const neymar = new Player("Neymar", brazil, flamengo);

        const sticker1 = new Sticker(1, messi, new Category("NEW", "REGULAR"));
        const sticker2 = new Sticker(2, neymar, new Category("NEW", "SHINY"));
        const sticker3 = new Sticker(
            3,
            messi,
            new Category("DAMAGED", "REGULAR"),
        );

        mockStickersById.set(sticker1.number, sticker1);
        mockStickersById.set(sticker2.number, sticker2);
        mockStickersById.set(sticker3.number, sticker3);
    });

    describe("getStickers", () => {
        it("returns all stickers when no filters", async () => {
            const stickers = await StickerService.getStickers();
            expect(stickers).toHaveLength(3);
        });

        it("filters by state", async () => {
            const stickers = await StickerService.getStickers({ state: "NEW" });
            expect(stickers).toHaveLength(2);
            expect(stickers.every((s) => s.isNewSticker())).toBe(true);
        });

        it("filters by type", async () => {
            const stickers = await StickerService.getStickers({
                type: "SHINY",
            });
            expect(stickers).toHaveLength(1);
            expect(stickers[0].number).toBe(2);
        });

        it("filters by team", async () => {
            const stickers = await StickerService.getStickers({
                team: "Argentina",
            });
            expect(stickers).toHaveLength(2);
            expect(
                stickers.every((s) => s.playsForNationalTeam("Argentina")),
            ).toBe(true);
        });

        it("filters by club", async () => {
            const stickers = await StickerService.getStickers({
                club: "Boca Juniors",
            });
            expect(stickers).toHaveLength(2);
            expect(stickers.every((s) => s.playsForClub("Boca Juniors"))).toBe(
                true,
            );
        });

        it("combines multiple filters", async () => {
            const stickers = await StickerService.getStickers({
                state: "NEW",
                type: "REGULAR",
            });
            expect(stickers).toHaveLength(1);
            expect(stickers[0].number).toBe(1);
        });
    });

    describe("getStickerById", () => {
        it("returns sticker when exists", async () => {
            const sticker = await StickerService.getStickerByNumber("1");
            expect(sticker?.number).toBe(1);
        });

        it("returns null when not exists", async () => {
            const sticker = await StickerService.getStickerByNumber("999");
            expect(sticker).toBeNull();
        });
    });

    describe("getStickerByIdOrFail", () => {
        it("returns sticker when exists", async () => {
            const sticker = await StickerService.getStickerByNumberOrFail("1");
            expect(sticker.number).toBe(1);
        });

        it("throws error when not exists", async () => {
            await expect(
                StickerService.getStickerByNumberOrFail("999"),
            ).rejects.toThrow("Sticker #999 not found");
        });
    });

    describe("getPlayers", () => {
        it("returns unique player names", async () => {
            const players = await StickerService.getPlayers();
            expect(players).toEqual(["Lionel Messi", "Neymar"]);
        });
    });

    describe("getTeams", () => {
        it("returns unique team names", async () => {
            const teams = await StickerService.getTeams();
            expect(teams).toEqual(["Argentina", "Brazil"]);
        });
    });

    describe("getClubs", () => {
        it("returns unique club names", async () => {
            const clubs = await StickerService.getClubs();
            expect(clubs).toEqual(["Boca Juniors", "Flamengo"]);
        });
    });
});
