import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { buildUserRepoMock as mockBuildUserRepo } from "../helpers/repo-mocks";
import AuthService from "../../modules/auth/services/auth.service";
import { UserRole } from "../../modules/users/enums/user-role.enum";
import userRepository from "../../modules/users/repositories/user.repository";

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: mockBuildUserRepo(),
}));

describe("AuthService", () => {
    beforeEach(async () => {
        await userRepository.clear();
    });

    describe("getOrCreateUser", () => {
        it("crea un usuario con id no vacío en el primer login", async () => {
            const user = await AuthService.getOrCreateUser("auth0|abc123", {
                email: "ana@example.com",
                name: "Ana Perez",
            });

            expect(user.id).not.toBe("");
            expect(user.id).toMatch(/^[0-9a-f]{24}$/);
            expect(user.firstName).toBe("Ana");
            expect(user.lastName).toBe("Perez");
            expect(user.email).toBe("ana@example.com");
            expect(user.username).toBe("ana");
            expect(user.role).toBe(UserRole.STANDARD);
            expect(user.auth0Sub).toBe("auth0|abc123");
        });

        it("no sobreescribe usuarios cuando se crean dos en secuencia (regresión id='')", async () => {
            const a = await AuthService.getOrCreateUser("auth0|aaa", {
                email: "a@x.com",
                name: "A",
            });
            const b = await AuthService.getOrCreateUser("auth0|bbb", {
                email: "b@x.com",
                name: "B",
            });

            expect(a.id).not.toBe(b.id);
            expect(await userRepository.findAll()).toHaveLength(2);
            expect((await userRepository.findById(a.id))?.email).toBe(
                "a@x.com",
            );
            expect((await userRepository.findById(b.id))?.email).toBe(
                "b@x.com",
            );
        });

        it("retorna el mismo usuario al volver a invocar con el mismo sub", async () => {
            const first = await AuthService.getOrCreateUser("auth0|same", {
                email: "s@x.com",
                name: "S",
            });
            const second = await AuthService.getOrCreateUser("auth0|same", {
                email: "ignored@x.com",
                name: "Z",
            });

            expect(second.id).toBe(first.id);
            expect(await userRepository.findAll()).toHaveLength(1);
        });

        it("deriva el username de la parte local del email y no lo iguala al email", async () => {
            const user = await AuthService.getOrCreateUser("auth0|ana", {
                email: "ana.lopez@example.com",
                name: "Ana Lopez",
            });

            expect(user.username).toBe("ana.lopez");
            expect(user.username).not.toBe(user.email);
        });

        it("agrega un sufijo numerico cuando el username derivado ya existe", async () => {
            const first = await AuthService.getOrCreateUser("auth0|ana1", {
                email: "ana@example.com",
                name: "Ana Uno",
            });
            const second = await AuthService.getOrCreateUser("auth0|ana2", {
                email: "ana@other.com",
                name: "Ana Dos",
            });

            expect(first.username).toBe("ana");
            expect(second.username).toBe("ana1");
        });

        it("deriva el username del sub (normalizado) cuando no hay email", async () => {
            const user = await AuthService.getOrCreateUser("auth0|noemail", {});
            expect(user.username).toBe("auth0noemail");
            expect(user.email).toBe("");
        });
    });

    describe("getCurrentUser", () => {
        it("devuelve el usuario por id interno", async () => {
            const created = await AuthService.getOrCreateUser("auth0|x", {
                email: "x@x.com",
            });
            const found = await AuthService.getCurrentUser(created.id);
            expect(found?.id).toBe(created.id);
        });

        it("devuelve undefined si el id no existe", async () => {
            const found = await AuthService.getCurrentUser("inexistente");
            expect(found).toBeNull();
        });
    });
});
