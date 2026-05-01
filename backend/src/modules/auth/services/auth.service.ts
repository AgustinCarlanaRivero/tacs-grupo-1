import { User } from "../../users/entities/user.entity"
import { UserRole } from "../../users/enums/user-role.enum"
import authRepository from "../repositories/auth.repository"

interface Auth0Profile {
    email?: string
    name?: string
}

export default class AuthService {
    /**
     * Busca un usuario por su Auth0 sub. Si no existe, lo crea con datos del perfil
     * (JIT provisioning) y le asigna un id único antes de persistirlo.
     *
     * @param auth0Sub identificador único de Auth0 (claim `sub` del JWT)
     * @param profile datos opcionales tomados del access token / userinfo
     * @returns el usuario existente o el recién creado
     */
    static async getOrCreateUser(auth0Sub: string, profile: Auth0Profile): Promise<User> {
        const existing = authRepository.findByAuth0Sub(auth0Sub)
        if (existing) return existing

        const name = profile.name?.split(" ") ?? []
        const user = new User(
            name[0] ?? "",
            name.slice(1).join(" "),
            profile.email ?? auth0Sub,
            profile.email ?? "",
            UserRole.STANDARD,
            0,
            null,
            crypto.randomUUID(),
        )
        user.auth0Sub = auth0Sub

        return authRepository.save(user)
    }

    /**
     * Devuelve el usuario actual autenticado por su id interno.
     */
    static async getCurrentUser(userId: string): Promise<User | undefined> {
        return authRepository.findById(userId)
    }
}
