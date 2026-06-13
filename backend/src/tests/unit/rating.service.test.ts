import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Rating } from "../../modules/ratings/entities/rating.entity";
import ratingRepository from "../../modules/ratings/repositories/rating.repository";
import RatingService from "../../modules/ratings/services/rating.service";
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";
import {
    BadRequestError,
    NotFoundError,
} from "../../shared/errors/http-errors";

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

describe("RatingService", () => {
    beforeEach(() => {
        ratingRepository.clear();
        userRepository.clear();
    });

    test("createRating throws when reviewee missing", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        userRepository.save(reviewer);

        await expect(
            RatingService.createRating("nope", "rev", { score: 5 }),
        ).rejects.toThrow(NotFoundError);
    });

    test("createRating persists rating and updates reputation", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        const reviewee = new User("E", "Two", "ee", "e@x.com");
        reviewee.setId("ee");
        userRepository.save(reviewer);
        userRepository.save(reviewee);

        const result = await RatingService.createRating("ee", "rev", {
            score: 4,
            comment: "ok",
        });

        expect(result.score).toBe(4);
        expect(result.revieweeId).toBe("ee");

        const saved = (await userRepository.findById("ee"))!;
        expect(saved.reputation).toBe(4);
    });

    test("createRating throws BadRequestError when score missing", async () => {
        const reviewer = new User("R", "One", "rev", "r@x.com");
        reviewer.setId("rev");
        const reviewee = new User("E", "Two", "ee", "e@x.com");
        reviewee.setId("ee");
        userRepository.save(reviewer);
        userRepository.save(reviewee);

        await expect(
            // @ts-expect-error intentionally missing score
            RatingService.createRating("ee", "rev", {}),
        ).rejects.toThrow(BadRequestError);
    });
});
