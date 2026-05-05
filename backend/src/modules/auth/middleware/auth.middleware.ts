import { auth } from "express-oauth2-jwt-bearer";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { UnauthorizedError } from "../../../shared/errors/http-errors";
import AuthService from "../services/auth.service";

let jwtVerifier: RequestHandler | null = null;

/**
 * Middleware de Auth0 que valida la firma y claims del JWT contra el issuer y la audience.
 * Se construye de forma perezosa para que el servidor pueda arrancar con DISABLE_AUTH=true
 * sin tener AUTH0_* definidas (p. ej. Docker dev).
 */
export const verifyJwt: RequestHandler = (req, res, next) => {
  const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;
  const audience = process.env.AUTH0_AUDIENCE;
  if (!issuerBaseURL || !audience) {
    return next(
      new Error(
        "Auth0 no configurado: definí AUTH0_ISSUER_BASE_URL y AUTH0_AUDIENCE o usá DISABLE_AUTH=true"
      )
    );
  }
  if (!jwtVerifier) {
    jwtVerifier = auth({ issuerBaseURL, audience });
  }
  return jwtVerifier(req, res, next);
};

/**
 * Asocia el usuario interno (provisionado en demand) al request a partir del claim `sub`
 * del JWT. Debe ejecutarse después de `verifyJwt`. Si no hay sub o falla el provisioning
 * propaga 401/500 vía `next(err)` para que lo maneje el error middleware global.
 */
export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const auth0Sub = req.auth?.payload?.sub;
    if (!auth0Sub) {
      return next(new UnauthorizedError("Token sin claim 'sub'"));
    }

    const user = await AuthService.getOrCreateUser(auth0Sub, {
      email: req.auth?.payload?.email as string | undefined,
      name: req.auth?.payload?.name as string | undefined,
    });

    (req as Request & { user: { id: string; role: string } }).user = {
      id: user.id,
      role: user.role,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware de desarrollo para deshabilitar Auth0.
 * Asigna un usuario fijo en req.user para permitir pruebas locales con Postman.
 */
export function attachDevUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const devUserId = process.env.MOCK_USER_ID ?? "seed-user-ana";
  const devUserRole = process.env.MOCK_USER_ROLE ?? "STANDARD";

  (req as Request & { user: { id: string; role: string } }).user = {
    id: devUserId,
    role: devUserRole,
  };

  return next();
}
