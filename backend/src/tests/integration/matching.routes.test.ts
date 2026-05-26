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
    buildMatchingRepoMock,
    buildUserRepoMock,
} from "../helpers/repo-mocks";

const userRepoMock = buildUserRepoMock();
const matchingRepoMock = buildMatchingRepoMock();

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: userRepoMock,
}));
jest.mock("../../modules/matching/repositories/matching.repository", () => ({
    __esModule: true,
    default: matchingRepoMock,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("user-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await userRepoMock.clear();
});

describe("Matching routes (integration)", () => {
    test("GET /matches?stickerId returns users who own the sticker", async () => {
        const sticker = buildSticker(50);
        await userRepoMock.save(
            buildUser("user-2", {
                username: "u2",
                reputation: 5,
                collection: buildCollection([buildCollectionItem(sticker, 3)]),
            }),
        );
        await userRepoMock.save(
            buildUser("user-3", {
                username: "u3",
                reputation: 1,
                collection: buildCollection([buildCollectionItem(buildSticker(99), 1)]),
            }),
        );

        const res = await request(app)
            .get("/matches?stickerId=50")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].userId).toBe("user-2");
        expect(res.body.data[0].quantity).toBe(3);
    });

    test("GET /users/:userId/suggestions returns users with offerable stickers", async () => {
        const wanted = buildSticker(60);
        await userRepoMock.save(
            buildUser("user-1", {
                collection: buildCollection([], [wanted]),
            }),
        );
        await userRepoMock.save(
            buildUser("user-2", {
                username: "u2",
                collection: buildCollection([buildCollectionItem(wanted, 2)]),
            }),
        );

        const res = await request(app)
            .get("/users/user-1/suggestions")
            .expect(200);

        expect(res.body.total).toBe(1);
        expect(res.body.data[0].userId).toBe("user-2");
        expect(res.body.data[0].offerableStickers[0].number).toBe(60);
    });

    test("GET /users/:userId/suggestions returns empty when user has no missing stickers", async () => {
        await userRepoMock.save(
            buildUser("user-1", { collection: buildCollection([], []) }),
        );

        const res = await request(app)
            .get("/users/user-1/suggestions")
            .expect(200);

        expect(res.body.total).toBe(0);
    });
});
