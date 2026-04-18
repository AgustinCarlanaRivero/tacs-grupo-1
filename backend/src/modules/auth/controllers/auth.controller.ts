import { Request, Response } from "express"
import { AppError } from "../../../shared/errors/app-error.ts"
import AuthService from "../services/auth.service.ts"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export default class AuthController {
    getMe = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new AppError("No autenticado", 401)
        }

        const user = await AuthService.getCurrentUser(userId)
        if (!user) {
            throw new AppError("Usuario no encontrado", 404)
        }

        return res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
        })
    }
}
