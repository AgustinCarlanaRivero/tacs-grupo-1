import {
    beforeAll,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from "@jest/globals";
import type { Express } from "express";
import request from "supertest";
import { getTestApp } from "../helpers/build-app";
import { buildSticker } from "../helpers/builders";
import { buildStickerRepoMock } from "../helpers/repo-mocks";

const mockStickerRepo = buildStickerRepoMock();

jest.mock("../../modules/stickers/repositories/sticker.repository", () => ({
    __esModule: true,
    default: mockStickerRepo,
}));

let app: Express;

beforeAll(async () => {
    app = await getTestApp();
});

beforeEach(() => {
    mockStickerRepo.clear();
});

describe("Stickers routes (integration)", () => {
    test("GET /stickers lists all", async () => {
        mockStickerRepo.save(buildSticker(1));
        mockStickerRepo.save(buildSticker(2));

        const res = await request(app).get("/stickers").expect(200);

        expect(res.body).toHaveLength(2);
    });

    test("GET /stickers?team=Argentina filters by team", async () => {
        mockStickerRepo.save(buildSticker(1, { teamName: "Argentina" }));
        mockStickerRepo.save(buildSticker(2, { teamName: "Brasil" }));

        const res = await request(app)
            .get("/stickers?team=Argentina")
            .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].number).toBe(1);
    });

    test("GET /stickers/:id returns sticker detail", async () => {
        mockStickerRepo.save(buildSticker(42, { playerName: "Messi" }));

        const res = await request(app).get("/stickers/42").expect(200);

        expect(res.body.number).toBe(42);
        expect(res.body.player.name).toBe("Messi");
    });

    test("GET /stickers/:id returns 404 when sticker missing", async () => {
        const res = await request(app).get("/stickers/999").expect(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    test("GET /stickers/players returns unique players sorted", async () => {
        mockStickerRepo.save(buildSticker(1, { playerName: "Messi" }));
        mockStickerRepo.save(buildSticker(2, { playerName: "Aimar" }));
        mockStickerRepo.save(buildSticker(3, { playerName: "Messi" }));

        const res = await request(app).get("/stickers/players").expect(200);

        expect(res.body).toEqual(["Aimar", "Messi"]);
    });
});
