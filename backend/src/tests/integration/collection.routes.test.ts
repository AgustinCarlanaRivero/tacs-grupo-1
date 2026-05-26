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
import { getTestApp, setMockUser } from "../helpers/build-app";
import {
    buildCollection,
    buildCollectionItem,
    buildSticker,
    buildUser,
} from "../helpers/builders";
import {
    buildCollectionRepoMock,
    buildStickerRepoMock,
    buildUserRepoMock,
} from "../helpers/repo-mocks";

const userRepoMock = buildUserRepoMock();
const stickerRepoMock = buildStickerRepoMock();
const collectionRepoMock = buildCollectionRepoMock();

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: userRepoMock,
}));
jest.mock("../../modules/stickers/repositories/sticker.repository", () => ({
    __esModule: true,
    default: stickerRepoMock,
}));
jest.mock("../../modules/collection/repositories/collection.repository", () => ({
    __esModule: true,
    default: collectionRepoMock,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("user-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await userRepoMock.clear();
    stickerRepoMock.clear();
    await collectionRepoMock.clear();
});

describe("Collection routes (integration)", () => {
    test("GET /users/:userId/collection returns the collection", async () => {
        await userRepoMock.save(buildUser("user-1"));
        const sticker = buildSticker(7);
        collectionRepoMock.store.set(
            "user-1",
            buildCollection([buildCollectionItem(sticker, 2)], [buildSticker(8)]),
        );

        const res = await request(app)
            .get("/users/user-1/collection")
            .expect(200);

        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].quantity).toBe(2);
        expect(res.body.missingStickers).toHaveLength(1);
    });

    test("POST /users/:userId/collection/items adds an item", async () => {
        await userRepoMock.save(buildUser("user-1"));
        stickerRepoMock.save(buildSticker(10));

        const res = await request(app)
            .post("/users/user-1/collection/items")
            .send({ stickerId: 10, quantity: 3 })
            .expect(201);

        expect(res.body.stickerId).toBe(10);
        expect(res.body.quantity).toBe(3);
        expect(collectionRepoMock.store.get("user-1")?.items).toHaveLength(1);
    });

    test("PATCH /users/:userId/collection/items/:stickerId updates quantity", async () => {
        await userRepoMock.save(buildUser("user-1"));
        const sticker = buildSticker(11);
        stickerRepoMock.save(sticker);
        collectionRepoMock.store.set(
            "user-1",
            buildCollection([buildCollectionItem(sticker, 1)]),
        );

        const res = await request(app)
            .patch("/users/user-1/collection/items/11")
            .send({ quantity: 5 })
            .expect(200);

        expect(res.body.quantity).toBe(5);
    });

    test("DELETE /users/:userId/collection/items/:stickerId removes item", async () => {
        await userRepoMock.save(buildUser("user-1"));
        const sticker = buildSticker(12);
        stickerRepoMock.save(sticker);
        collectionRepoMock.store.set(
            "user-1",
            buildCollection([buildCollectionItem(sticker, 1)]),
        );

        await request(app)
            .delete("/users/user-1/collection/items/12")
            .expect(204);

        expect(collectionRepoMock.store.get("user-1")?.items).toHaveLength(0);
    });

    test("POST /users/:userId/collection/missing adds a missing sticker", async () => {
        await userRepoMock.save(buildUser("user-1"));
        stickerRepoMock.save(buildSticker(13));

        const res = await request(app)
            .post("/users/user-1/collection/missing")
            .send({ stickerId: 13 })
            .expect(201);

        expect(res.body.stickerId).toBe(13);
        expect(
            collectionRepoMock.store.get("user-1")?.missingStickers,
        ).toHaveLength(1);
    });

    test("DELETE /users/:userId/collection/missing/:stickerId removes missing", async () => {
        await userRepoMock.save(buildUser("user-1"));
        const sticker = buildSticker(14);
        stickerRepoMock.save(sticker);
        collectionRepoMock.store.set("user-1", buildCollection([], [sticker]));

        await request(app)
            .delete("/users/user-1/collection/missing/14")
            .expect(204);

        expect(
            collectionRepoMock.store.get("user-1")?.missingStickers,
        ).toHaveLength(0);
    });
});
