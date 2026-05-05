import { Request, Response } from "express"
import { NotFoundError, UnauthorizedError } from "../../../shared/errors/http-errors"
import AuthService from "../services/auth.service"
import { userResponseSchema } from "../../users/schemas/user.schemas"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export default class AuthController {
    /**
     * GET /auth/me
     * Devuelve el perfil del usuario autenticado a partir del id seteado por
     * `attachUser`. Responde 401 si la request no trae usuario y 404 si el
     * usuario fue eliminado entre la validación y la consulta.
     */
    getMe = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new UnauthorizedError()
        }

        const user = await AuthService.getCurrentUser(userId)
        if (!user) {
            throw new NotFoundError("Usuario no encontrado")
        }

        return res.status(200).json(userResponseSchema.parse(user))
    }
}
