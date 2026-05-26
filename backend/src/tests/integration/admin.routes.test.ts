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
import { UserRole } from "../../modules/users/enums/user-role.enum";
import { getTestApp, setMockUser } from "../helpers/build-app";
import { buildUser } from "../helpers/builders";
import {
    buildNotificationRepoMock,
    buildUserRepoMock,
} from "../helpers/repo-mocks";

const userRepoMock = buildUserRepoMock();
const notificationRepoMock = buildNotificationRepoMock();

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: userRepoMock,
}));
jest.mock("../../modules/notifications/repositories/notification.repository", () => ({
    __esModule: true,
    default: notificationRepoMock,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("admin-1", "ADMIN");
    app = await getTestApp();
});

beforeEach(async () => {
    await userRepoMock.clear();
    await notificationRepoMock.clear();
});

describe("Admin routes (integration)", () => {
    test("GET /admin/stats returns aggregated stats for an ADMIN", async () => {
        setMockUser("admin-1", "ADMIN");
        await userRepoMock.save(
            buildUser("admin-1", { role: UserRole.ADMIN, reputation: 10 }),
        );
        await userRepoMock.save(
            buildUser("user-1", { role: UserRole.STANDARD, reputation: 4 }),
        );

        const res = await request(app).get("/admin/stats").expect(200);

        expect(res.body.users.total).toBe(2);
        expect(res.body.users.byRole.admin).toBe(1);
        expect(res.body.users.byRole.standard).toBe(1);
        expect(res.body.notifications.total).toBe(0);
    });

    test("GET /admin/users returns 403 for STANDARD users", async () => {
        setMockUser("user-1", "STANDARD");

        await request(app).get("/admin/users").expect(403);
    });

    test("PATCH /admin/users/:userId/role updates the role", async () => {
        setMockUser("admin-1", "ADMIN");
        await userRepoMock.save(
            buildUser("admin-1", { role: UserRole.ADMIN }),
        );
        await userRepoMock.save(
            buildUser("user-1", { role: UserRole.STANDARD }),
        );

        const res = await request(app)
            .patch("/admin/users/user-1/role")
            .send({ role: UserRole.ADMIN })
            .expect(200);

        expect(res.body.role).toBe(UserRole.ADMIN);
    });

    test("PATCH /admin/users/:self/role rejects self-demotion", async () => {
        setMockUser("admin-1", "ADMIN");
        await userRepoMock.save(
            buildUser("admin-1", { role: UserRole.ADMIN }),
        );

        const res = await request(app)
            .patch("/admin/users/admin-1/role")
            .send({ role: UserRole.STANDARD })
            .expect(400);

        expect(res.body.message).toMatch(/degradar/i);
    });
});
