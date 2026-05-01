import { describe, it, expect, beforeEach } from "@jest/globals"
import AdminService from "../../modules/admin/services/admin.service"
import AuthService from "../../modules/auth/services/auth.service"
import authRepository from "../../modules/auth/repositories/auth.repository"
import notificationRepository from "../../modules/notifications/repositories/notification.repository"
import notificationService from "../../modules/notifications/services/notification.service"
import { UserRole } from "../../modules/users/enums/user-role.enum"
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum"
import { AppError } from "../../shared/errors/app-error"

async function seedAdmin(sub = "auth0|admin"): Promise<string> {
    const u = await AuthService.getOrCreateUser(sub, { email: "admin@x.com", name: "Admin Root" })
    u.role = UserRole.ADMIN
    authRepository.save(u)
    return u.id
}

async function seedStandard(sub: string, email: string): Promise<string> {
    const u = await AuthService.getOrCreateUser(sub, { email, name: "User" })
    return u.id
}

describe("AdminService", () => {
    beforeEach(() => {
        authRepository.clear()
        notificationRepository.clear()
    })

    describe("getStats", () => {
        it("agrega usuarios por rol y notificaciones por tipo / estado", async () => {
            await seedAdmin()
            await seedStandard("auth0|s1", "s1@x.com")
            await seedStandard("auth0|s2", "s2@x.com")

            const n1 = await notificationService.notify("u", NotificationType.OFFER_RECEIVED, "1")
            await notificationService.notify("u", NotificationType.OFFER_RECEIVED, "2")
            await notificationService.notify("u", NotificationType.AUCTION_ENDING, "3")
            await notificationService.markAsRead(n1.id, "u")

            const stats = await AdminService.getStats()

            expect(stats.users.total).toBe(3)
            expect(stats.users.byRole).toEqual({ standard: 2, admin: 1 })
            expect(stats.notifications.total).toBe(3)
            expect(stats.notifications.unread).toBe(2)
            expect(stats.notifications.read).toBe(1)
            expect(stats.notifications.byType[NotificationType.OFFER_RECEIVED]).toBe(2)
            expect(stats.notifications.byType[NotificationType.AUCTION_ENDING]).toBe(1)
        })
    })

    describe("updateUserRole", () => {
        it("rechaza un rol inválido con 400", async () => {
            const adminId = await seedAdmin()
            const targetId = await seedStandard("auth0|t", "t@x.com")
            await expect(
                AdminService.updateUserRole(targetId, "SUPERADMIN", adminId),
            ).rejects.toMatchObject({ statusCode: 400 })
        })

        it("rechaza con 404 si el usuario no existe", async () => {
            const adminId = await seedAdmin()
            await expect(
                AdminService.updateUserRole("no-existe", UserRole.ADMIN, adminId),
            ).rejects.toBeInstanceOf(AppError)
        })

        it("impide que un admin se degrade a sí mismo", async () => {
            const adminId = await seedAdmin()
            await seedAdmin("auth0|admin2") // backup admin para que no sea el último
            await expect(
                AdminService.updateUserRole(adminId, UserRole.STANDARD, adminId),
            ).rejects.toMatchObject({ statusCode: 400 })
        })

        it("impide degradar al último admin", async () => {
            const adminId = await seedAdmin()
            const otherAdmin = await AuthService.getOrCreateUser("auth0|other", { email: "o@x.com" })
            otherAdmin.role = UserRole.ADMIN
            authRepository.save(otherAdmin)

            await expect(
                AdminService.updateUserRole(otherAdmin.id, UserRole.STANDARD, adminId),
            ).resolves.toBeDefined()

            await expect(
                AdminService.updateUserRole(adminId, UserRole.STANDARD, "otro-admin-id"),
            ).rejects.toMatchObject({ statusCode: 400 })
        })

        it("actualiza correctamente un rol válido", async () => {
            const adminId = await seedAdmin()
            const targetId = await seedStandard("auth0|t", "t@x.com")

            const result = await AdminService.updateUserRole(targetId, UserRole.ADMIN, adminId)

            expect(result.role).toBe(UserRole.ADMIN)
            expect(authRepository.findById(targetId)?.role).toBe(UserRole.ADMIN)
        })
    })

    describe("getUserById", () => {
        it("devuelve los datos públicos del usuario", async () => {
            const id = await seedStandard("auth0|t", "t@x.com")
            const u = await AdminService.getUserById(id)
            expect(u.id).toBe(id)
            expect(u.email).toBe("t@x.com")
        })

        it("404 si no existe", async () => {
            await expect(AdminService.getUserById("nope")).rejects.toMatchObject({ statusCode: 404 })
        })
    })
})
