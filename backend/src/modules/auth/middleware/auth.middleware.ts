import { auth } from "express-oauth2-jwt-bearer"
import type { Request, Response, NextFunction } from "express"
import { UnauthorizedError } from "../../../shared/errors/http-errors"
import AuthService from "../services/auth.service"

/**
 * Middleware de Auth0 que valida la firma y claims del JWT contra el issuer y la audience
 * configurados por env. Rechaza con 401 si el token es inválido o falta.
 */
export const verifyJwt = auth({
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    audience: process.env.AUTH0_AUDIENCE,
})

/**
 * Asocia el usuario interno (provisionado en demand) al request a partir del claim `sub`
 * del JWT. Debe ejecutarse después de `verifyJwt`. Si no hay sub o falla el provisioning
 * propaga 401/500 vía `next(err)` para que lo maneje el error middleware global.
 */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
    try {
        const auth0Sub = req.auth?.payload?.sub
        if (!auth0Sub) {
            return next(new UnauthorizedError("Token sin claim 'sub'"))
        }

        const user = await AuthService.getOrCreateUser(auth0Sub, {
            email: req.auth?.payload?.email as string | undefined,
            name: req.auth?.payload?.name as string | undefined,
        })

        ;(req as Request & { user: { id: string; role: string } }).user = {
            id: user.id,
            role: user.role,
        }

        return next()
    } catch (err) {
        return next(err)
    }
}
