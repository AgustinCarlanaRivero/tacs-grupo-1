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
    setMockUser("admin-1", "ADMIN");
    app = await getTestApp();
});

beforeEach(async () => {
    await mockUserRepo.clear();
});

describe("Users routes (integration)", () => {
    test("GET /users returns paginated list", async () => {
        await mockUserRepo.save(buildUser("user-1"));
        await mockUserRepo.save(buildUser("user-2"));

        const res = await request(app).get("/users").expect(200);

        expect(res.body.total).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });

    test("GET /users/:userId returns user", async () => {
        await mockUserRepo.save(buildUser("user-1"));

        const res = await request(app).get("/users/user-1").expect(200);
        expect(res.body.id).toBe("user-1");
    });

    test("PATCH /users/:userId updates user data", async () => {
        setMockUser("admin-1", "ADMIN");
        await mockUserRepo.save(buildUser("user-1"));

        const res = await request(app)
            .patch("/users/user-1")
            .send({ username: "updated" })
            .expect(200);

        expect(res.body.username).toBe("updated");
    });

    test("PATCH /users/:userId returns 409 on duplicate username", async () => {
        setMockUser("admin-1", "ADMIN");
        await mockUserRepo.save(buildUser("user-1", { username: "user1" }));
        await mockUserRepo.save(buildUser("user-2", { username: "taken" }));

        const res = await request(app)
            .patch("/users/user-1")
            .send({ username: "taken" })
            .expect(409);

        expect(res.body.message).toMatch(/username/i);
    });

    test("DELETE /users/:userId removes user", async () => {
        setMockUser("admin-1", "ADMIN");
        await mockUserRepo.save(buildUser("user-1"));

        await request(app).delete("/users/user-1").expect(204);
        expect(mockUserRepo.store.size).toBe(0);
    });

    test("PATCH /users/:other returns 403 when STANDARD updates someone else", async () => {
        setMockUser("user-1", "STANDARD");
        await mockUserRepo.save(buildUser("user-1"));
        await mockUserRepo.save(buildUser("user-2"));

        await request(app)
            .patch("/users/user-2")
            .send({ username: "hack" })
            .expect(403);
    });
});
