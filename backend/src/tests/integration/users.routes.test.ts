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
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";

const mockUsersById = new Map<string, User>();

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

let app: Express;

beforeAll(async () => {
    process.env.DISABLE_AUTH = "true";
    process.env.MOCK_USER_ID = "admin-1";
    process.env.MOCK_USER_ROLE = "ADMIN";
    const module = await import("../../app/app");
    app = module.default;
});

beforeEach(() => {
    userRepository.clear();
});

function buildUser(id: string, username: string) {
    const user = new User("Test", "User", username, `${username}@example.com`);
    user.setId(id);
    return user;
}

describe("Users routes (integration)", () => {
    test("GET /users returns paginated list", async () => {
        userRepository.save(buildUser("user-1", "user1"));
        userRepository.save(buildUser("user-2", "user2"));

        const res = await request(app).get("/users").expect(200);

        expect(res.body.total).toBe(2);
        expect(res.body.data).toHaveLength(2);
    });

    test("PATCH /users/:userId updates user data", async () => {
        userRepository.save(buildUser("user-1", "user1"));

        const res = await request(app)
            .patch("/users/user-1")
            .send({ username: "updated" })
            .expect(200);

        expect(res.body.username).toBe("updated");
    });
});
