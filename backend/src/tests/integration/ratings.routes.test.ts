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
import { buildRating, buildUser } from "../helpers/builders";
import {
    buildNotificationsFacadeMock,
    buildRatingRepoMock,
    buildUserRepoMock,
} from "../helpers/repo-mocks";

const mockRatingRepo = buildRatingRepoMock();
const mockUserRepo = buildUserRepoMock();
const mockNotificationsFacade = buildNotificationsFacadeMock();

jest.mock("../../modules/ratings/repositories/rating.repository", () => ({
    __esModule: true,
    default: mockRatingRepo,
}));
jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: mockUserRepo,
}));
jest.mock("../../modules/notifications/services/notification.facade", () => ({
    __esModule: true,
    notifications: mockNotificationsFacade,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("reviewer-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await mockRatingRepo.clear();
    await mockUserRepo.clear();
});

describe("Ratings routes (integration)", () => {
    test("GET /users/:userId/ratings returns paginated list", async () => {
        const reviewer = buildUser("reviewer-1");
        const reviewee = buildUser("reviewee-1");
        await mockRatingRepo.save(buildRating("rating-1", reviewer, reviewee, 4));

        const res = await request(app)
            .get("/users/reviewee-1/ratings")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].revieweeId).toBe("reviewee-1");
    });

    test("POST /users/:userId/ratings creates rating and notifies reviewee", async () => {
        setMockUser("reviewer-1", "STANDARD");
        await mockUserRepo.save(buildUser("reviewer-1"));
        await mockUserRepo.save(buildUser("reviewee-1"));

        const res = await request(app)
            .post("/users/reviewee-1/ratings")
            .send({ score: 5, comment: "great" })
            .expect(201);

        expect(res.body.reviewerId).toBe("reviewer-1");
        expect(res.body.revieweeId).toBe("reviewee-1");
        expect(res.body.score).toBe(5);
        expect(mockNotificationsFacade.ratingReceived).toHaveBeenCalledWith(
            "reviewee-1",
            expect.objectContaining({ fromUserId: "reviewer-1", score: 5 }),
        );
    });

    test("POST /users/:userId/ratings returns 400 when score is missing", async () => {
        setMockUser("reviewer-1", "STANDARD");
        await mockUserRepo.save(buildUser("reviewer-1"));
        await mockUserRepo.save(buildUser("reviewee-1"));

        await request(app)
            .post("/users/reviewee-1/ratings")
            .send({ comment: "no score" })
            .expect(400);
    });
});
