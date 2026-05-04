import { z } from "zod"

// ============================================================
// Primitivos reutilizables
// ============================================================

export const nonEmptyString = z.string().min(1)
export const positiveInt = z.number().int().positive()
export const nonNegativeInt = z.number().int().nonnegative()
export const positiveIntString = z.string().regex(/^[0-9]+$/, "Debe ser un número entero positivo")
export const isoDateTime = z.iso.datetime({ message: "Debe ser una fecha ISO 8601" })

/**
 * Boolean parseado desde query string. Sólo "true" cuenta como verdadero;
 * cualquier otro valor (incluido ausente) es `false`. Marca como `optional`
 * cuando el filtro no viene siempre.
 */
export const booleanQuery = z
    .enum(["true", "false"])
    .optional()
    .transform(v => v === "true")

/** Optional text query; empty strings become undefined. */
export const queryString = z
    .string()
    .trim()
    .optional()
    .transform(value => (value && value.length > 0 ? value : undefined))

/**
 * Helper para construir respuestas paginadas tipadas. Devuelve un schema con
 * `data`, `page`, `limit` y `total`, que es la forma que ya usan
 * MatchingService.getMatches/getSuggestionsByUser.
 */
export function paginatedResponseSchema<TItem extends z.ZodTypeAny>(item: TItem) {
    return z.object({
        data: z.array(item),
        page: positiveInt,
        limit: positiveInt,
        total: nonNegativeInt,
    })
}

// ============================================================
// Params comunes (URL) — usados desde múltiples módulos
// ============================================================

export const idParamSchema = z.object({ id: nonEmptyString })
export const userIdParamSchema = z.object({ userId: nonEmptyString })
export const postIdParamSchema = z.object({ postId: nonEmptyString })
export const offerIdParamSchema = z.object({ offerId: nonEmptyString })
export const notificationIdParamSchema = z.object({ id: nonEmptyString })

/** Param `:stickerId` cuando el sticker se identifica por su número entero. */
export const stickerIdParamSchema = z.object({ stickerId: positiveIntString })

/** Param `:id` para el detalle de un sticker (`/stickers/:id`). */
export const stickerNumericIdParamSchema = z.object({ id: positiveIntString })

/** Combinaciones para rutas anidadas. */
export const userPostParamsSchema = userIdParamSchema.extend({ postId: nonEmptyString })
export const userPostOfferParamsSchema = userPostParamsSchema.extend({ offerId: nonEmptyString })
export const userStickerParamsSchema = userIdParamSchema.extend({ stickerId: positiveIntString })

// ============================================================
// Query comunes
// ============================================================

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
})
