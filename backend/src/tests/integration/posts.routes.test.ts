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
import { PostState } from "../../modules/posts/enums/post-state.enum";
import { PostType } from "../../modules/posts/enums/post-type.enum";
import { getTestApp, setMockUser } from "../helpers/build-app";
import { buildDirectTrade, buildSticker, buildUser } from "../helpers/builders";
import {
    buildCollectionRepoMock,
    buildOfferRepoMock,
    buildPostRepoMock,
    buildStickerRepoMock,
    buildUserRepoMock,
    buildNotificationsFacadeMock,
} from "../helpers/repo-mocks";

const postRepoMock = buildPostRepoMock();
const offerRepoMock = buildOfferRepoMock();
const userRepoMock = buildUserRepoMock();
const stickerRepoMock = buildStickerRepoMock();
const collectionRepoMock = buildCollectionRepoMock();
const notificationsFacadeMock = buildNotificationsFacadeMock();

jest.mock("../../modules/posts/repositories/post.repository", () => ({
    __esModule: true,
    default: postRepoMock,
}));
jest.mock("../../modules/offers/repositories/offer.repository", () => ({
    __esModule: true,
    default: offerRepoMock,
}));
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
jest.mock("../../modules/notifications/services/notification.facade", () => ({
    __esModule: true,
    notifications: notificationsFacadeMock,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("owner-1", "ADMIN");
    app = await getTestApp();
});

beforeEach(async () => {
    await postRepoMock.clear();
    await offerRepoMock.clear();
    await userRepoMock.clear();
    stickerRepoMock.clear();
    await collectionRepoMock.clear();
});

describe("Posts routes (integration)", () => {
    test("GET /posts returns paginated posts", async () => {
        await postRepoMock.save(
            buildDirectTrade("post-1", buildUser("owner-1"), 10),
        );
        await postRepoMock.save(
            buildDirectTrade("post-2", buildUser("owner-2"), 11),
        );

        const res = await request(app).get("/posts").expect(200);

        expect(res.body.total).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });

    test("GET /users/:userId/posts filters by owner", async () => {
        await postRepoMock.save(
            buildDirectTrade("post-1", buildUser("owner-1"), 10),
        );
        await postRepoMock.save(
            buildDirectTrade("post-2", buildUser("owner-2"), 11),
        );

        const res = await request(app).get("/users/owner-1/posts").expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].owner.id).toBe("owner-1");
    });

    test("GET /users/:userId/posts/:postId returns 404 on owner mismatch", async () => {
        await postRepoMock.save(
            buildDirectTrade("post-1", buildUser("owner-1"), 10),
        );

        const res = await request(app)
            .get("/users/owner-2/posts/post-1")
            .expect(404);

        expect(res.body.message).toBe("Publicacion no encontrada");
    });

    test("POST /users/:userId/posts creates a direct trade", async () => {
        setMockUser("owner-1", "STANDARD");
        await userRepoMock.save(buildUser("owner-1"));
        stickerRepoMock.save(buildSticker(42));

        const res = await request(app)
            .post("/users/owner-1/posts")
            .send({ type: PostType.DIRECT_TRADE, stickerId: 42 })
            .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.type).toBe(PostType.DIRECT_TRADE);
        expect(res.body.sticker.id).toBe(42);
        expect(postRepoMock.store.size).toBe(1);
    });

    test("PATCH /users/:userId/posts/:postId/state transitions to COMPLETED", async () => {
        setMockUser("owner-1", "STANDARD");
        await postRepoMock.save(
            buildDirectTrade("post-1", buildUser("owner-1"), 10),
        );

        const res = await request(app)
            .patch("/users/owner-1/posts/post-1/state")
            .send({ state: PostState.COMPLETED })
            .expect(200);

        expect(res.body.state).toBe(PostState.COMPLETED);
    });

    test("DELETE /users/:userId/posts/:postId removes post + cascades offers", async () => {
        setMockUser("owner-1", "STANDARD");
        await postRepoMock.save(
            buildDirectTrade("post-1", buildUser("owner-1"), 10),
        );

        await request(app).delete("/users/owner-1/posts/post-1").expect(204);

        expect(postRepoMock.store.size).toBe(0);
        expect(offerRepoMock.deleteByPostId).toHaveBeenCalledWith("post-1");
    });
});
