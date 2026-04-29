import type { Request, Response, NextFunction, RequestHandler } from "express"
import type { ZodType } from "zod"
import { BadRequestError } from "../errors/http-errors"

/**
 * Devuelve un middleware que valida `req.body` contra el schema de Zod recibido.
 * Si la validación falla, responde 400 con el detalle. Si pasa, sustituye el body
 * por el dato parseado para que los handlers consuman valores ya tipados.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const message = result.error.issues
                .map(i => `${i.path.join(".") || "body"}: ${i.message}`)
                .join("; ")
            return next(new BadRequestError(`Body inválido. ${message}`))
        }
        req.body = result.data
        return next()
    }
}
