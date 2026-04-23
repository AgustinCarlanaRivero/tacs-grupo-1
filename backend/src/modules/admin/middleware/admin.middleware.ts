import type { Request, Response, NextFunction } from "express"
import { AppError } from "../../../shared/errors/app-error"
import { UserRole } from "../../users/enums/user-role.enum"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
    const user = (req as AuthenticatedRequest).user

    if (!user) {
        throw new AppError("No autenticado", 401)
    }

    if (user.role !== UserRole.ADMIN) {
        throw new AppError("Acceso denegado: se requiere rol de administrador", 403)
    }

    next()
}
