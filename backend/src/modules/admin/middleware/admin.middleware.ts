import type { Request, Response, NextFunction } from "express"
import { ForbiddenError, UnauthorizedError } from "../../../shared/errors/http-errors"
import { UserRole } from "../../users/enums/user-role.enum"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

/**
 * Bloquea con 401 si no hay usuario en la request, o con 403 si el usuario
 * autenticado no tiene rol ADMIN. Debe ejecutarse después de `attachUser`.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
    const user = (req as AuthenticatedRequest).user

    if (!user) {
        throw new UnauthorizedError()
    }

    if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenError("Acceso denegado: se requiere rol de administrador")
    }

    next()
}
