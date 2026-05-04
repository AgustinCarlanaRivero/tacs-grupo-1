import { AppError } from "./app-error"

/**
 * 400 — el request es inválido (formato, tipos, reglas de negocio sobre el input).
 */
export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400)
        this.name = "BadRequestError"
    }
}

/**
 * 401 — falta autenticación o el token es inválido.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = "No autenticado") {
        super(message, 401)
        this.name = "UnauthorizedError"
    }
}

/**
 * 403 — el usuario está autenticado pero no tiene permiso sobre el recurso.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = "No autorizado") {
        super(message, 403)
        this.name = "ForbiddenError"
    }
}

/**
 * 404 — el recurso pedido no existe.
 */
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404)
        this.name = "NotFoundError"
    }
}

/**
 * 409 — conflicto con el estado actual del recurso.
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409)
        this.name = "ConflictError"
    }
}

export const isHttpError = (err: unknown): err is AppError => err instanceof AppError
