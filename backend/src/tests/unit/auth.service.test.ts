import { describe, it, expect, beforeEach } from "@jest/globals"
import AuthService from "../../modules/auth/services/auth.service"
import authRepository from "../../modules/auth/repositories/auth.repository"
import { UserRole } from "../../modules/users/enums/user-role.enum"

describe("AuthService", () => {
    beforeEach(() => {
        authRepository.clear()
    })

    describe("getOrCreateUser", () => {
        it("crea un usuario con id no vacío en el primer login", async () => {
            const user = await AuthService.getOrCreateUser("auth0|abc123", {
                email: "ana@example.com",
                name: "Ana Perez",
            })

            expect(user.id).not.toBe("")
            expect(user.id).toMatch(/[0-9a-f-]{36}/)
            expect(user.firstName).toBe("Ana")
            expect(user.lastName).toBe("Perez")
            expect(user.email).toBe("ana@example.com")
            expect(user.username).toBe("ana@example.com")
            expect(user.role).toBe(UserRole.STANDARD)
            expect(user.auth0Sub).toBe("auth0|abc123")
        })

        it("no sobreescribe usuarios cuando se crean dos en secuencia (regresión id='')", async () => {
            const a = await AuthService.getOrCreateUser("auth0|aaa", { email: "a@x.com", name: "A" })
            const b = await AuthService.getOrCreateUser("auth0|bbb", { email: "b@x.com", name: "B" })

            expect(a.id).not.toBe(b.id)
            expect(authRepository.findAll()).toHaveLength(2)
            expect(authRepository.findById(a.id)?.email).toBe("a@x.com")
            expect(authRepository.findById(b.id)?.email).toBe("b@x.com")
        })

        it("retorna el mismo usuario al volver a invocar con el mismo sub", async () => {
            const first = await AuthService.getOrCreateUser("auth0|same", { email: "s@x.com", name: "S" })
            const second = await AuthService.getOrCreateUser("auth0|same", { email: "ignored@x.com", name: "Z" })

            expect(second.id).toBe(first.id)
            expect(authRepository.findAll()).toHaveLength(1)
        })

        it("usa el sub como username cuando no hay email en el profile", async () => {
            const user = await AuthService.getOrCreateUser("auth0|noemail", {})
            expect(user.username).toBe("auth0|noemail")
            expect(user.email).toBe("")
        })
    })

    describe("getCurrentUser", () => {
        it("devuelve el usuario por id interno", async () => {
            const created = await AuthService.getOrCreateUser("auth0|x", { email: "x@x.com" })
            const found = await AuthService.getCurrentUser(created.id)
            expect(found?.id).toBe(created.id)
        })

        it("devuelve undefined si el id no existe", async () => {
            const found = await AuthService.getCurrentUser("inexistente")
            expect(found).toBeUndefined()
        })
    })
})
