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
import { OfferState } from "../../modules/offers/enums/offer-state.enum";
import { getTestApp, setMockUser } from "../helpers/build-app";
import {
    buildCollection,
    buildCollectionItem,
    buildDirectTrade,
    buildOffer,
    buildSticker,
    buildUser,
} from "../helpers/builders";
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
    setMockUser("offerer-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await postRepoMock.clear();
    await offerRepoMock.clear();
    await userRepoMock.clear();
    stickerRepoMock.clear();
    await collectionRepoMock.clear();
});

describe("Offers routes (integration)", () => {
    test("GET /users/:userId/offers?role=sent returns sent offers", async () => {
        const offerer = buildUser("offerer-1");
        const sticker = buildSticker(10);
        await offerRepoMock.save(
            buildOffer("offer-1", offerer, [buildCollectionItem(sticker)], {
                postId: "post-1",
                postOwnerId: "owner-1",
            }),
        );

        const res = await request(app)
            .get("/users/offerer-1/offers?role=sent")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].offerer.id).toBe("offerer-1");
    });

    test("GET /users/:userId/posts/:postId/offers returns offers for the post", async () => {
        const owner = buildUser("owner-1");
        await postRepoMock.save(buildDirectTrade("post-1", owner, 10));

        const offerer = buildUser("offerer-1");
        await offerRepoMock.save(
            buildOffer("offer-1", offerer, [buildCollectionItem(buildSticker(11))], {
                postId: "post-1",
                postOwnerId: owner.id,
            }),
        );
        await offerRepoMock.save(
            buildOffer("offer-2", offerer, [buildCollectionItem(buildSticker(12))], {
                postId: "post-1",
                postOwnerId: owner.id,
            }),
        );

        const res = await request(app)
            .get("/users/owner-1/posts/post-1/offers")
            .expect(200);

        expect(res.body.total).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });

    test("POST /users/:userId/posts/:postId/offers creates an offer", async () => {
        setMockUser("offerer-1", "STANDARD");
        const owner = buildUser("owner-1");
        const offerer = buildUser("offerer-1");
        const sticker = buildSticker(20);

        await userRepoMock.save(owner);
        await userRepoMock.save(offerer);
        await postRepoMock.save(buildDirectTrade("post-1", owner, 21));
        collectionRepoMock.store.set(
            "offerer-1",
            buildCollection([buildCollectionItem(sticker, 2)]),
        );

        const res = await request(app)
            .post("/users/owner-1/posts/post-1/offers")
            .send({ offered: [{ stickerId: 20, quantity: 1 }] })
            .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.state).toBe(OfferState.PENDING);
        expect(res.body.offerer.id).toBe("offerer-1");
        expect(notificationsFacadeMock.offerReceived).toHaveBeenCalledWith(
            "owner-1",
            expect.objectContaining({ postId: "post-1", fromUserId: "offerer-1" }),
        );
    });

    test("PATCH .../offers/:offerId/state APPROVED notifies offerer", async () => {
        setMockUser("owner-1", "STANDARD");
        const owner = buildUser("owner-1");
        const offerer = buildUser("offerer-1");
        const sticker = buildSticker(30);

        await userRepoMock.save(owner);
        await userRepoMock.save(offerer);
        const post = buildDirectTrade("post-1", owner, 31);
        const offer = buildOffer("offer-1", offerer, [buildCollectionItem(sticker, 1)], {
            postId: "post-1",
            postOwnerId: owner.id,
        });
        post.offers = [offer];
        await postRepoMock.save(post);
        await offerRepoMock.save(offer);

        const res = await request(app)
            .patch("/users/owner-1/posts/post-1/offers/offer-1/state")
            .send({ state: OfferState.APPROVED })
            .expect(200);

        expect(res.body.state).toBe(OfferState.APPROVED);
        expect(notificationsFacadeMock.offerAccepted).toHaveBeenCalledWith(
            "offerer-1",
            expect.objectContaining({ offerId: "offer-1", postId: "post-1" }),
        );
    });
});
