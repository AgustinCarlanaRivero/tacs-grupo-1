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
    buildUserRepoMock,
    buildNotificationsFacadeMock,
} from "../helpers/repo-mocks";

const mockPostRepo = buildPostRepoMock();
const mockOfferRepo = buildOfferRepoMock();
const mockUserRepo = buildUserRepoMock();
const mockCollectionRepo = buildCollectionRepoMock();
const mockNotificationsFacade = buildNotificationsFacadeMock();

jest.mock("../../modules/posts/repositories/post.repository", () => ({
    __esModule: true,
    default: mockPostRepo,
}));
jest.mock("../../modules/offers/repositories/offer.repository", () => ({
    __esModule: true,
    default: mockOfferRepo,
}));
jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: mockUserRepo,
}));
jest.mock("../../modules/collection/repositories/collection.repository", () => ({
    __esModule: true,
    default: mockCollectionRepo,
}));
jest.mock("../../modules/notifications/services/notification.facade", () => ({
    __esModule: true,
    notifications: mockNotificationsFacade,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("offerer-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await mockPostRepo.clear();
    await mockOfferRepo.clear();
    await mockUserRepo.clear();
    await mockCollectionRepo.clear();
});

describe("Offers routes (integration)", () => {
    test("GET /users/:userId/offers?role=sent returns sent offers", async () => {
        const offerer = buildUser("offerer-1");
        const sticker = buildSticker(10);
        await mockOfferRepo.save(
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
        await mockPostRepo.save(buildDirectTrade("post-1", owner, 10));

        const offerer = buildUser("offerer-1");
        await mockOfferRepo.save(
            buildOffer("offer-1", offerer, [buildCollectionItem(buildSticker(11))], {
                postId: "post-1",
                postOwnerId: owner.id,
            }),
        );
        await mockOfferRepo.save(
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

        await mockUserRepo.save(owner);
        await mockUserRepo.save(offerer);
        await mockPostRepo.save(buildDirectTrade("post-1", owner, 21));
        mockCollectionRepo.store.set(
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
        expect(mockNotificationsFacade.offerReceived).toHaveBeenCalledWith(
            "owner-1",
            expect.objectContaining({ postId: "post-1", fromUserId: "offerer-1" }),
        );
    });

    test("PATCH .../offers/:offerId/state APPROVED notifies offerer", async () => {
        setMockUser("owner-1", "STANDARD");
        const owner = buildUser("owner-1");
        const offerer = buildUser("offerer-1");
        const sticker = buildSticker(30);

        await mockUserRepo.save(owner);
        await mockUserRepo.save(offerer);
        const post = buildDirectTrade("post-1", owner, 31);
        const offer = buildOffer("offer-1", offerer, [buildCollectionItem(sticker, 1)], {
            postId: "post-1",
            postOwnerId: owner.id,
        });
        post.offers = [offer];
        await mockPostRepo.save(post);
        await mockOfferRepo.save(offer);

        const res = await request(app)
            .patch("/users/owner-1/posts/post-1/offers/offer-1/state")
            .send({ state: OfferState.APPROVED })
            .expect(200);

        expect(res.body.state).toBe(OfferState.APPROVED);
        expect(mockNotificationsFacade.offerAccepted).toHaveBeenCalledWith(
            "offerer-1",
            expect.objectContaining({ offerId: "offer-1", postId: "post-1" }),
        );
    });
});
