import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import { Offer } from "../../modules/offers/entities/offer.entity";
import type { OfferReadModel } from "../../modules/offers/repositories/offer.repository";
import offerRepository from "../../modules/offers/repositories/offer.repository";
import OfferService from "../../modules/offers/services/offer.service";
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import type { Post } from "../../modules/posts/entities/post.entity";
import postRepository from "../../modules/posts/repositories/post.repository";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";
import { NotFoundError } from "../../shared/errors/http-errors";

const mockOfferRecords: OfferReadModel[] = [];
const mockPostsById = new Map<string, Post>();
const mockUsersById = new Map<string, User>();

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

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: {
        findByAuth0Sub: (_sub: string) => undefined,
        findById: (id: string) => mockUsersById.get(id),
        findAll: () => Array.from(mockUsersById.values()),
        findByEmail: (email: string) =>
            Array.from(mockUsersById.values()).find(
                (user) => user.email === email,
            ),
        findByUsername: (username: string) =>
            Array.from(mockUsersById.values()).find(
                (user) => user.username === username,
            ),
        save: (user: User) => {
            mockUsersById.set(user.id, user);
            return user;
        },
        delete: (id: string) => mockUsersById.delete(id),
        clear: () => {
            mockUsersById.clear();
        },
    },
}));

jest.mock(
    "../../modules/collection/repositories/collection.repository",
    () => ({
        __esModule: true,
        default: {
            getCollection: async (_userId: string) => null,
        },
    }),
);

describe("OfferService", () => {
    beforeEach(() => {
        offerRepository.clear();
        postRepository.clear();
        userRepository.clear();
    });

    test("getOffersByUser returns sent/received filtering", async () => {
        const owner = new User("O", "One", "owner", "o@x.com");
        owner.setId("owner");
        const offerer = new User("F", "Two", "from", "f@x.com");
        offerer.setId("from");
        userRepository.save(owner);
        userRepository.save(offerer);

        const player = new Player("P", new NationalTeam("NT"), new Club("C"));
        const sticker = new Sticker(21, player, "NEW", "REGULAR");

        const post = new DirectTrade(owner, sticker);
        post.setId("post1");
        postRepository.save(post);

        const offered: CollectionItem[] = [{ sticker, quantity: 1 }];
        const offer = new Offer(offerer, offered);
        offer.setId("offer1");
        post.addOffer(offer);

        offerRepository.save(
            Object.assign(offer, {
                postId: post.id ?? "post1",
                postOwnerId: owner.id,
            }),
        );

        const sent = await OfferService.getOffersByUser("from", {
            page: 1,
            limit: 10,
            role: "sent",
        });
        expect(sent.total).toBe(1);

        const received = await OfferService.getOffersByUser("owner", {
            page: 1,
            limit: 10,
            role: "received",
        });
        expect(received.total).toBe(1);
    });

    test("createOffer throws when post not found", async () => {
        const offerer = new User("F", "Two", "from", "f@x.com");
        offerer.setId("from");
        userRepository.save(offerer);

        await expect(
            OfferService.createOffer("owner", "nope", "from", {
                offered: [{ stickerId: 1 }],
            }),
        ).rejects.toThrow(NotFoundError);
    });
});
