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
import { buildUser } from "../helpers/builders";
import { buildUserRepoMock } from "../helpers/repo-mocks";

const mockUserRepo = buildUserRepoMock();

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: mockUserRepo,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("me-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await mockUserRepo.clear();
});

describe("Auth routes (integration)", () => {
    test("GET /auth/me returns the current user when found", async () => {
        setMockUser("me-1", "STANDARD");
        await mockUserRepo.save(
            buildUser("me-1", { username: "me", email: "me@example.com" }),
        );

        const res = await request(app).get("/auth/me").expect(200);

        expect(res.body.id).toBe("me-1");
        expect(res.body.username).toBe("me");
    });

    test("GET /auth/me returns 404 when current user does not exist", async () => {
        setMockUser("ghost", "STANDARD");

        const res = await request(app).get("/auth/me").expect(404);
        expect(res.body.message).toBe("Usuario no encontrado");
    });
});
