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
import type { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import { Offer } from "../../modules/offers/entities/offer.entity";
import type { OfferReadModel } from "../../modules/offers/repositories/offer.repository";
import offerRepository from "../../modules/offers/repositories/offer.repository";
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import type { Post } from "../../modules/posts/entities/post.entity";
import postRepository from "../../modules/posts/repositories/post.repository";
import { Category } from "../../modules/stickers/entities/category.entity";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { User } from "../../modules/users/entities/user.entity";

const mockOfferRecords: OfferReadModel[] = [];
const mockPostsById = new Map<string, Post>();

jest.mock("../../modules/offers/repositories/offer.repository", () => ({
    __esModule: true,
    default: {
        save: (offer: OfferReadModel) => {
            mockOfferRecords.push(offer);
            return offer;
        },
        findById: (id: string) =>
            mockOfferRecords.find((record) => record.id === id),
        findByPostId: (postId: string) =>
            mockOfferRecords.filter((record) => record.postId === postId),
        findByUserId: (userId: string) =>
            mockOfferRecords.filter((record) => {
                const offererId = record.offerer.id;
                return offererId === userId || record.postOwnerId === userId;
            }),
        findAll: () => [...mockOfferRecords],
        delete: (id: string) => {
            const index = mockOfferRecords.findIndex(
                (record) => record.id === id,
            );
            if (index < 0) return false;
            mockOfferRecords.splice(index, 1);
            return true;
        },
        clear: () => {
            mockOfferRecords.length = 0;
        },
    },
}));

jest.mock("../../modules/posts/repositories/post.repository", () => ({
    __esModule: true,
    default: {
        save: (post: Post) => {
            if (!post.id) {
                post.setId(`post-${mockPostsById.size + 1}`);
            }
            mockPostsById.set(post.id ?? "", post);
            return post;
        },
        findById: (id: string) => mockPostsById.get(id),
        findAll: () => Array.from(mockPostsById.values()),
        findByOwnerId: (ownerId: string) =>
            Array.from(mockPostsById.values()).filter(
                (post) => post.owner.id === ownerId,
            ),
        delete: (id: string) => mockPostsById.delete(id),
        clear: () => {
            mockPostsById.clear();
        },
    },
}));

let app: Express;

beforeAll(async () => {
    process.env.DISABLE_AUTH = "true";
    process.env.MOCK_USER_ID = "user-1";
    process.env.MOCK_USER_ROLE = "ADMIN";
    const module = await import("../../app/app");
    app = module.default;
});

beforeEach(() => {
    offerRepository.clear();
    postRepository.clear();
});

function buildUser(id: string, username: string) {
    const user = new User("Test", "User", username, `${username}@example.com`);
    user.setId(id);
    return user;
}

function buildSticker(number: number) {
    const player = new Player("Player", new NationalTeam("NT"), new Club("FC"));
    return new Sticker(number, player, new Category("NEW", "REGULAR"));
}

function buildPost(id: string, owner: User, stickerNumber: number) {
    const sticker = buildSticker(stickerNumber);
    const post = new DirectTrade(owner, sticker);
    post.setId(id);
    return post;
}

function buildOffer(id: string, offerer: User, stickerNumber: number) {
    const sticker = buildSticker(stickerNumber);
    const offered: CollectionItem[] = [{ sticker, quantity: 1 }];
    const offer = new Offer(offerer, offered);
    offer.setId(id);
    return offer;
}

describe("Offers routes (integration)", () => {
    test("GET /users/:userId/offers supports role=sent", async () => {
        const owner = buildUser("owner-1", "owner1");
        const offerer = buildUser("offerer-1", "offerer1");
        const offer = buildOffer("offer-1", offerer, 10);

        offerRepository.save(
            Object.assign(offer, {
                postId: "post-1",
                postOwnerId: owner.id,
            }),
        );

        const res = await request(app)
            .get("/users/offerer-1/offers?role=sent")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].offerer.id).toBe("offerer-1");
    });

    test("GET /users/:userId/posts/:postId/offers returns offers for post", async () => {
        const owner = buildUser("owner-1", "owner1");
        const post = buildPost("post-1", owner, 10);
        postRepository.save(post);

        const offerer = buildUser("offerer-1", "offerer1");
        offerRepository.save(
            Object.assign(buildOffer("offer-1", offerer, 11), {
                postId: "post-1",
                postOwnerId: owner.id,
            }),
        );
        offerRepository.save(
            Object.assign(buildOffer("offer-2", offerer, 12), {
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
});
