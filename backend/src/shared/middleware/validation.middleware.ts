import type { Request, Response, NextFunction, RequestHandler } from "express"
import type { ZodType } from "zod"
import { BadRequestError } from "../errors/http-errors"

function createValidationMiddleware<T>(schema: ZodType<T>, target: "body" | "params" | "query"): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const value = target === "body" ? req.body : target === "params" ? req.params : req.query
        const result = schema.safeParse(value)
        if (!result.success) {
            const message = result.error.issues
                .map(i => `${i.path.join(".") || target}: ${i.message}`)
                .join("; ")
            return next(new BadRequestError(`${target.charAt(0).toUpperCase() + target.slice(1)} inválido. ${message}`))
        }

        if (target === "body") {
            req.body = result.data
        } else if (target === "params") {
            req.params = result.data as Record<string, string>
        } else {
            req.query = result.data as unknown as Request["query"]
        }

        return next()
    }
}

/**
 * Valida `req.body` contra un schema Zod y reemplaza el body con el dato parseado.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
    return createValidationMiddleware(schema, "body")
}

/**
 * Valida `req.params` contra un schema Zod y reemplaza los params parseados.
 */
export function validateParams<T>(schema: ZodType<T>): RequestHandler {
    return createValidationMiddleware(schema, "params")
}

/**
 * Valida `req.query` contra un schema Zod y reemplaza el query parseado.
 */
export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
    return createValidationMiddleware(schema, "query")
}
