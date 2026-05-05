/**
 * Helpers para construir request/response OpenAPI de forma consistente.
 */
import type { ZodType } from "zod"

/**
 * Requisito de seguridad bearer para endpoints autenticados.
 */
export const bearer = [{ bearerAuth: [] }]

/**
 * Construye un request body JSON requerido.
 */
export function jsonBody<T extends ZodType>(schema: T, description?: string) {
    return {
        description,
        required: true,
        content: { "application/json": { schema } },
    }
}

/**
 * Construye una respuesta JSON tipada para OpenAPI.
 */
export function jsonResponse<T extends ZodType>(description: string, schema: T) {
    return {
        description,
        content: { "application/json": { schema } },
    }
}

/**
 * Respuesta sin body, solo descripcion.
 */
export const noContent = (description: string) => ({ description })

/**
 * Respuestas de error comunes para endpoints protegidos o validados.
 */
export const errorResponses = {
    400: noContent("Request inválido (validación Zod)"),
    401: noContent("No autenticado"),
    403: noContent("Sin permisos sobre el recurso"),
    404: noContent("Recurso no encontrado"),
}
