import { auth } from "express-oauth2-jwt-bearer"
import type { Request, Response, NextFunction } from "express"
import AuthService from "../services/auth.service"

export const verifyJwt = auth({
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    audience: process.env.AUTH0_AUDIENCE,
})

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
    const auth0Sub = req.auth?.payload?.sub
    if (!auth0Sub) {
        return next()
    }

    const user = await AuthService.getOrCreateUser(auth0Sub, {
        email: req.auth?.payload?.email as string | undefined,
        name: req.auth?.payload?.name as string | undefined,
    })

    ;(req as Request & { user: { id: string; role: string } }).user = {
        id: user.id,
        role: user.role,
    }

    next()
}
