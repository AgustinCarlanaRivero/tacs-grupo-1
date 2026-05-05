import type { Request, Response, NextFunction, RequestHandler } from "express"
import type { ZodType } from "zod"
import { BadRequestError } from "../errors/http-errors"

type ValidationTarget = "body" | "params" | "query"

function readTarget(req: Request, target: ValidationTarget): unknown {
    if (target === "body") return req.body
    if (target === "params") return req.params
    return req.query
}

function writeTarget(req: Request, target: ValidationTarget, data: unknown): void {
    if (target === "body") {
        req.body = data
        return
    }
    if (target === "params") {
        req.params = data as Record<string, string>
        return
    }
    // Express 5: `req.query` está definido como getter en el prototipo y no admite
    // reasignación directa. Sobrescribimos la propiedad en la instancia con
    // `defineProperty` para que controllers posteriores lean el dato parseado.
    Object.defineProperty(req, "query", {
        value: data,
        writable: true,
        configurable: true,
        enumerable: true,
    })
}

function createValidationMiddleware<T>(schema: ZodType<T>, target: ValidationTarget): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(readTarget(req, target))
        if (!result.success) {
            const detail = result.error.issues
                .map(i => `${i.path.join(".") || target}: ${i.message}`)
                .join("; ")
            const label = target.charAt(0).toUpperCase() + target.slice(1)
            return next(new BadRequestError(`${label} inválido. ${detail}`))
        }

        writeTarget(req, target, result.data)
        return next()
    }
}

/**
 * Valida `req.body` contra un schema Zod y reemplaza el body con el dato parseado
 * (incluye defaults y coerciones del schema).
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
 * Valida `req.query` contra un schema Zod. En Express 5 el query es read-only,
 * por eso sobrescribimos la propiedad con `defineProperty` para que los handlers
 * posteriores reciban los valores ya parseados (con coerciones y defaults).
 */
export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
    return createValidationMiddleware(schema, "query")
}
