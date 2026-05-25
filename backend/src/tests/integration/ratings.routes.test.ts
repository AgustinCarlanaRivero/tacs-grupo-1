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
import { Rating } from "../../modules/ratings/entities/rating.entity";
import ratingRepository from "../../modules/ratings/repositories/rating.repository";
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";

const mockRatings: Rating[] = [];
const mockUsersById = new Map<string, User>();

jest.mock("../../modules/ratings/repositories/rating.repository", () => ({
    __esModule: true,
    default: {
        save: (rating: Rating) => {
            if (!rating.id) {
                rating.setId(`rating-${mockRatings.length + 1}`);
            }
            mockRatings.push(rating);
            return rating;
        },
        findById: (id: string) =>
            mockRatings.find((rating) => rating.id === id),
        findByRevieweeId: (revieweeId: string) =>
            mockRatings.filter((rating) => rating.reviewee.id === revieweeId),
        findByReviewerId: (reviewerId: string) =>
            mockRatings.filter((rating) => rating.reviewer.id === reviewerId),
        findAll: () => [...mockRatings],
        clear: () => {
            mockRatings.length = 0;
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

jest.mock("../../modules/notifications/services/notification.facade", () => ({
    __esModule: true,
    notifications: {
        ratingReceived: async (
            _toUserId: string,
            _ctx: { ratingId: string; fromUserId: string; score: number },
        ) => undefined,
    },
}));

let app: Express;

beforeAll(async () => {
    process.env.DISABLE_AUTH = "true";
    process.env.MOCK_USER_ID = "reviewer-1";
    process.env.MOCK_USER_ROLE = "STANDARD";
    const module = await import("../../app/app");
    app = module.default;
});

beforeEach(() => {
    ratingRepository.clear();
    userRepository.clear();
});

function buildUser(id: string, username: string) {
    const user = new User("Test", "User", username, `${username}@example.com`);
    user.setId(id);
    return user;
}

describe("Ratings routes (integration)", () => {
    test("GET /users/:userId/ratings returns paginated list", async () => {
        const reviewer = buildUser("reviewer-1", "reviewer1");
        const reviewee = buildUser("reviewee-1", "reviewee1");
        const rating = new Rating(
            reviewer,
            reviewee,
            4,
            "ok",
            new Date("2024-01-01T00:00:00.000Z"),
        );
        rating.setId("rating-1");
        ratingRepository.save(rating);

        const res = await request(app)
            .get("/users/reviewee-1/ratings")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].revieweeId).toBe("reviewee-1");
    });

    test("POST /users/:userId/ratings creates rating", async () => {
        const reviewer = buildUser("reviewer-1", "reviewer1");
        const reviewee = buildUser("reviewee-1", "reviewee1");
        userRepository.save(reviewer);
        userRepository.save(reviewee);

        const res = await request(app)
            .post("/users/reviewee-1/ratings")
            .send({ score: 5, comment: "great" })
            .expect(201);

        expect(res.body.reviewerId).toBe("reviewer-1");
        expect(res.body.revieweeId).toBe("reviewee-1");
        expect(res.body.score).toBe(5);
    });
});
