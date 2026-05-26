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
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import { getTestApp, setMockUser } from "../helpers/build-app";
import { buildNotification } from "../helpers/builders";
import { buildNotificationRepoMock } from "../helpers/repo-mocks";

const mockNotificationRepo = buildNotificationRepoMock();

jest.mock("../../modules/notifications/repositories/notification.repository", () => ({
    __esModule: true,
    default: mockNotificationRepo,
}));

let app: Express;

beforeAll(async () => {
    setMockUser("user-1", "STANDARD");
    app = await getTestApp();
});

beforeEach(async () => {
    await mockNotificationRepo.clear();
});

describe("Notifications routes (integration)", () => {
    test("GET /users/:userId/notifications returns the user's notifications", async () => {
        setMockUser("user-1", "STANDARD");
        await mockNotificationRepo.save(
            buildNotification("n-1", "user-1", {
                type: NotificationType.OFFER_RECEIVED,
                message: "msg-1",
                createdAt: new Date("2026-01-01T00:00:00Z"),
            }),
        );
        await mockNotificationRepo.save(
            buildNotification("n-2", "user-2", {
                type: NotificationType.OFFER_RECEIVED,
                message: "other",
                createdAt: new Date("2026-01-02T00:00:00Z"),
            }),
        );

        const res = await request(app)
            .get("/users/user-1/notifications")
            .expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe("n-1");
    });

    test("GET /users/:userId/notifications returns 403 when STANDARD reads others", async () => {
        setMockUser("user-1", "STANDARD");

        await request(app).get("/users/user-2/notifications").expect(403);
    });

    test("GET /notifications/unread-count counts unread for current user", async () => {
        setMockUser("user-1", "STANDARD");
        await mockNotificationRepo.save(
            buildNotification("n-1", "user-1", { read: false }),
        );
        await mockNotificationRepo.save(
            buildNotification("n-2", "user-1", { read: true }),
        );
        await mockNotificationRepo.save(
            buildNotification("n-3", "user-1", { read: false }),
        );

        const res = await request(app)
            .get("/notifications/unread-count")
            .expect(200);

        expect(res.body.count).toBe(2);
    });

    test("PATCH /notifications/:id/read marks as read for owner", async () => {
        setMockUser("user-1", "STANDARD");
        await mockNotificationRepo.save(
            buildNotification("n-1", "user-1", { read: false }),
        );

        const res = await request(app)
            .patch("/notifications/n-1/read")
            .expect(200);

        expect(res.body.read).toBe(true);
    });

    test("PATCH /notifications/:id/read returns 403 for non-owner", async () => {
        setMockUser("user-1", "STANDARD");
        await mockNotificationRepo.save(
            buildNotification("n-1", "user-2", { read: false }),
        );

        await request(app).patch("/notifications/n-1/read").expect(403);
    });

    test("PATCH /notifications/read-all marks all unread as read", async () => {
        setMockUser("user-1", "STANDARD");
        await mockNotificationRepo.save(
            buildNotification("n-1", "user-1", { read: false }),
        );
        await mockNotificationRepo.save(
            buildNotification("n-2", "user-1", { read: false }),
        );

        const res = await request(app)
            .patch("/notifications/read-all")
            .expect(200);

        expect(res.body.marked).toBe(2);
    });
});
