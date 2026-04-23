import { User } from "../../users/entities/user.entity"
import { UserRole } from "../../users/enums/user-role.enum"
import authRepository from "../repositories/auth.repository"

interface Auth0Profile {
    email?: string
    name?: string
}

export default class AuthService {
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
        )
        user.auth0Sub = auth0Sub

        return authRepository.save(user)
    }

    static async getCurrentUser(userId: string): Promise<User | undefined> {
        return authRepository.findById(userId)
    }
}
