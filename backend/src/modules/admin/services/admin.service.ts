import { AppError } from "../../../shared/errors/app-error"
import { UserRole } from "../../users/enums/user-role.enum"
import authRepository from "../../auth/repositories/auth.repository"

export default class AdminService {
    static async getStats() {
        const users = authRepository.findAll()

        return {
            totalUsers: users.length,
            usersByRole: {
                standard: users.filter(u => u.role === UserRole.STANDARD).length,
                admin: users.filter(u => u.role === UserRole.ADMIN).length,
            },
        }
    }

    static async getUsers() {
        return authRepository.findAll().map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
        }))
    }

    static async getUserById(userId: string) {
        const user = authRepository.findById(userId)
        if (!user) {
            throw new AppError("Usuario no encontrado", 404)
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
        }
    }

    static async updateUserRole(userId: string, newRole: string) {
        if (newRole !== UserRole.STANDARD && newRole !== UserRole.ADMIN) {
            throw new AppError("Rol inválido. Debe ser STANDARD o ADMIN", 400)
        }

        const user = authRepository.findById(userId)
        if (!user) {
            throw new AppError("Usuario no encontrado", 404)
        }

        user.role = newRole
        authRepository.save(user)

        return {
            id: user.id,
            username: user.username,
            role: user.role,
        }
    }
}
