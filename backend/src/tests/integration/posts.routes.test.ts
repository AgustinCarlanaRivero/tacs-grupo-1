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
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import type { Post } from "../../modules/posts/entities/post.entity";
import postRepository from "../../modules/posts/repositories/post.repository";
import { Category } from "../../modules/stickers/entities/category.entity";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { User } from "../../modules/users/entities/user.entity";

const mockPostsById = new Map<string, Post>();

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

function buildPost(
    id: string,
    ownerId: string,
    ownerUsername: string,
    stickerNumber: number,
) {
    const owner = buildUser(ownerId, ownerUsername);
    const sticker = buildSticker(stickerNumber);
    const post = new DirectTrade(owner, sticker);
    post.setId(id);
    return post;
}

describe("Posts routes (integration)", () => {
    test("GET /posts returns paginated posts", async () => {
        postRepository.save(buildPost("post-1", "owner-1", "owner1", 10));
        postRepository.save(buildPost("post-2", "owner-2", "owner2", 11));

        const res = await request(app).get("/posts").expect(200);

        expect(res.body.total).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });

    test("GET /users/:userId/posts filters by owner", async () => {
        postRepository.save(buildPost("post-1", "owner-1", "owner1", 10));
        postRepository.save(buildPost("post-2", "owner-2", "owner2", 11));

        const res = await request(app).get("/users/owner-1/posts").expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].owner.id).toBe("owner-1");
    });

    test("GET /users/:userId/posts/:postId returns 404 on owner mismatch", async () => {
        postRepository.save(buildPost("post-1", "owner-1", "owner1", 10));

        const res = await request(app)
            .get("/users/owner-2/posts/post-1")
            .expect(404);

        expect(res.body.message).toBe("Publicacion no encontrada");
    });
});
