import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import { buildNotificationRepoMock as mockBuildNotificationRepo } from "../helpers/repo-mocks"
import notificationService from "../../modules/notifications/services/notification.service"
import notificationRepository from "../../modules/notifications/repositories/notification.repository"
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum"
import { AppError } from "../../shared/errors/app-error"

jest.mock("../../modules/notifications/repositories/notification.repository", () => ({
    __esModule: true,
    default: mockBuildNotificationRepo(),
}))

const USER_A = "user-a"
const USER_B = "user-b"

describe("NotificationService", () => {
    beforeEach(async () => {
        await notificationRepository.clear()
    })

    describe("notify", () => {
        it("crea la notificación, la persiste y la deja como no leída", async () => {
            const n = await notificationService.notify(
                USER_A,
                NotificationType.OFFER_RECEIVED,
                "Tenés una nueva oferta",
                { offerId: "o-1" },
            )

            expect(n.id).toMatch(/^[0-9a-f]{24}$/)
            expect(n.read).toBe(false)
            expect(n.payload).toEqual({ offerId: "o-1" })
            expect(await notificationRepository.findById(n.id)).toBe(n)
        })
    })

    describe("getByUserId", () => {
        it("solo devuelve notificaciones del usuario consultado", async () => {
            await notificationService.notify(USER_A, NotificationType.STICKER_AVAILABLE, "msg A")
            await notificationService.notify(USER_B, NotificationType.STICKER_AVAILABLE, "msg B")

            const forA = await notificationService.getByUserId(USER_A)
            expect(forA).toHaveLength(1)
            expect(forA[0].userId).toBe(USER_A)
        })

        it("filtra por no leídas cuando unreadOnly=true", async () => {
            const n1 = await notificationService.notify(USER_A, NotificationType.OFFER_RECEIVED, "1")
            await notificationService.notify(USER_A, NotificationType.OFFER_RECEIVED, "2")
            await notificationService.markAsRead(n1.id, USER_A)

            const unread = await notificationService.getByUserId(USER_A, true)
            expect(unread).toHaveLength(1)
            expect(unread[0].read).toBe(false)
        })
    })

    describe("markAsRead", () => {
        it("marca la notificación como leída y la persiste", async () => {
            const n = await notificationService.notify(USER_A, NotificationType.RATING_RECEIVED, "calif.")
            const updated = await notificationService.markAsRead(n.id, USER_A)
            expect(updated.read).toBe(true)
            expect((await notificationRepository.findById(n.id))?.read).toBe(true)
        })

        it("rechaza con 403 si el usuario no es el dueño (IDOR)", async () => {
            const n = await notificationService.notify(USER_A, NotificationType.RATING_RECEIVED, "x")
            await expect(notificationService.markAsRead(n.id, USER_B)).rejects.toMatchObject({
                statusCode: 403,
            })
        })

        it("rechaza con 404 si la notificación no existe", async () => {
            await expect(notificationService.markAsRead("inexistente", USER_A)).rejects.toBeInstanceOf(AppError)
        })
    })

    describe("markAllAsRead", () => {
        it("marca todas las no leídas del usuario y devuelve el count", async () => {
            await notificationService.notify(USER_A, NotificationType.OFFER_RECEIVED, "1")
            await notificationService.notify(USER_A, NotificationType.OFFER_RECEIVED, "2")
            await notificationService.notify(USER_B, NotificationType.OFFER_RECEIVED, "ajeno")

            const result = await notificationService.markAllAsRead(USER_A)
            expect(result).toEqual({ marked: 2 })

            expect((await notificationService.getUnreadCount(USER_A)).count).toBe(0)
            expect((await notificationService.getUnreadCount(USER_B)).count).toBe(1)
        })
    })
})
