import { z } from "zod"
import { UserRole } from "../../modules/users/enums/user-role.enum"
import { PostType } from "../../modules/posts/enums/post-type.enum"
import { PostState } from "../../modules/posts/enums/post-state.enum"
import { OfferState } from "../../modules/offers/enums/offer-state.enum"
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum"

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
// Params comunes (URL)
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

// ============================================================
// USER / AUTH
//
// Nota: el `.meta({ id })` que aparece al final de cada schema "público" es
// metadata estándar de Zod 4. La usamos como nombre del componente cuando se
// genera el OpenAPI (zod-to-openapi lee `.meta()` para los `$ref`). No afecta
// la validación.
// ============================================================

/** Request body para PATCH /users/:userId. Todos los campos opcionales (partial update). */
export const userUpdateRequestSchema = z
    .object({
        firstName: nonEmptyString.max(100),
        lastName: nonEmptyString.max(100),
        username: nonEmptyString.max(50),
        email: z.email(),
    })
    .partial()
    .refine(obj => Object.keys(obj).length > 0, { message: "Debe enviar al menos un campo a actualizar" })
    .meta({ id: "UserUpdateRequest" })

/**
 * Forma pública de un usuario expuesta por la API. Espeja `UserResponseDto`
 * (no incluye `auth0Sub` ni datos internos).
 */
export const userResponseSchema = z.object({
    id: nonEmptyString,
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.email(),
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
    reputation: z.number(),
}).meta({ id: "User" })

// ============================================================
// ADMIN
// ============================================================

/** PATCH /admin/users/:userId/role */
export const roleUpdateRequestSchema = z.object({
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
}).meta({ id: "RoleUpdateRequest" })

export const roleUpdateResponseSchema = z.object({
    id: nonEmptyString,
    username: z.string(),
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
}).meta({ id: "RoleUpdateResponse" })

export const statsResponseSchema = z.object({
    users: z.object({
        total: nonNegativeInt,
        byRole: z.object({
            standard: nonNegativeInt,
            admin: nonNegativeInt,
        }),
        topByReputation: z.array(
            z.object({
                id: nonEmptyString,
                username: z.string(),
                reputation: z.number(),
            }),
        ),
    }),
    notifications: z.object({
        total: nonNegativeInt,
        unread: nonNegativeInt,
        read: nonNegativeInt,
        byType: z.record(z.string(), nonNegativeInt),
    }),
}).meta({ id: "Stats" })

// ============================================================
// STICKERS
// ============================================================

export const stickerStateEnum = z.enum(["NEW", "DAMAGED"])
export const stickerTypeEnum = z.enum(["REGULAR", "SHINY"])

/** GET /stickers?state=&type=&team=&club= */
export const stickerFilterQuerySchema = z.object({
    state: stickerStateEnum.optional(),
    type: stickerTypeEnum.optional(),
    team: nonEmptyString.optional(),
    club: nonEmptyString.optional(),
})

/** Coincide con `Sticker.toJSON()`. */
export const stickerResponseSchema = z.object({
    id: positiveInt,
    title: z.string(),
    state: stickerStateEnum,
    type: stickerTypeEnum,
    description: z.string(),
    player: z.object({
        name: z.string(),
        nationalTeam: z.string().optional(),
        club: z.string().optional(),
        image: z.string(),
    }),
}).meta({ id: "Sticker" })

export const playerResponseSchema = z.object({
    name: z.string(),
    nationalTeam: z.object({ name: z.string() }).nullable().optional(),
    club: z.object({ name: z.string() }).nullable().optional(),
    image: z.string(),
}).meta({ id: "Player" })

export const nationalTeamResponseSchema = z.object({ name: z.string() }).meta({ id: "NationalTeam" })
export const clubResponseSchema = z.object({ name: z.string() }).meta({ id: "Club" })

// ============================================================
// COLLECTION
// ============================================================

/** POST /users/:userId/collection/items */
export const collectionItemAddRequestSchema = z.object({
    stickerId: positiveInt,
    quantity: positiveInt.default(1),
}).meta({ id: "CollectionItemAddRequest" })

/** PATCH /users/:userId/collection/items/:stickerId */
export const collectionItemUpdateQuantityRequestSchema = z.object({
    quantity: nonNegativeInt,
}).meta({ id: "CollectionItemUpdateQuantityRequest" })

/** POST /users/:userId/collection/missing */
export const missingStickerAddRequestSchema = z.object({
    stickerId: positiveInt,
}).meta({ id: "MissingStickerAddRequest" })

export const collectionItemResponseSchema = z.object({
    sticker: stickerResponseSchema,
    quantity: nonNegativeInt,
}).meta({ id: "CollectionItem" })

export const collectionResponseSchema = z.object({
    items: z.array(collectionItemResponseSchema),
    missingStickers: z.array(stickerResponseSchema),
}).meta({ id: "Collection" })

// ============================================================
// POSTS
// ============================================================

export const postTypeEnum = z.enum([PostType.DIRECT_TRADE, PostType.AUCTION])
export const postStateEnum = z.enum([PostState.ACTIVE, PostState.COMPLETED, PostState.CLOSED])

/** GET /users/:userId/posts?type=&state= */
export const postFilterQuerySchema = z.object({
    type: postTypeEnum.optional(),
    state: postStateEnum.optional(),
})

/**
 * POST /users/:userId/posts.
 * Si el `type` es AUCTION, se requieren `endsAt` y opcionalmente
 * `minimumRequirements`. Para DIRECT_TRADE esos campos no aplican.
 */
export const postCreateRequestSchema = z
    .object({
        type: postTypeEnum,
        stickerId: positiveInt,
        endsAt: isoDateTime.optional(),
        minimumRequirements: z.array(collectionItemAddRequestSchema).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === PostType.AUCTION && !data.endsAt) {
            ctx.addIssue({
                code: "custom",
                path: ["endsAt"],
                message: "endsAt es requerido para subastas",
            })
        }
    })
    .meta({ id: "PostCreateRequest" })

/** PATCH /users/:userId/posts/:postId/state */
export const postStateUpdateRequestSchema = z.object({
    state: postStateEnum,
}).meta({ id: "PostStateUpdateRequest" })

export const postResponseSchema = z.object({
    id: nonEmptyString,
    type: postTypeEnum,
    state: postStateEnum,
    sticker: stickerResponseSchema,
    owner: z.object({
        id: nonEmptyString,
        username: z.string(),
    }),
    createdAt: isoDateTime.optional(),
    endsAt: isoDateTime.optional(),
    minimumRequirements: z.array(collectionItemResponseSchema).optional(),
}).meta({ id: "Post" })

// ============================================================
// OFFERS
// ============================================================

export const offerStateEnum = z.enum([
    OfferState.PENDING,
    OfferState.APPROVED,
    OfferState.REJECTED,
    OfferState.CANCELLED,
])

/** GET /users/:userId/offers?role=sent|received|all */
export const offerRoleQuerySchema = z.object({
    role: z.enum(["sent", "received", "all"]).default("all"),
})

/** POST /users/:userId/posts/:postId/offers */
export const offerCreateRequestSchema = z.object({
    offered: z.array(collectionItemAddRequestSchema).min(1, "Debe ofrecer al menos una figurita"),
}).meta({ id: "OfferCreateRequest" })

/**
 * PATCH /users/:userId/posts/:postId/offers/:offerId/state.
 * El estado debe ser uno de los terminales (PENDING no se puede setear vía API).
 * El service además valida la transición real desde el estado actual.
 */
export const offerStateUpdateRequestSchema = z.object({
    state: z.enum([OfferState.APPROVED, OfferState.REJECTED, OfferState.CANCELLED]),
}).meta({ id: "OfferStateUpdateRequest" })

export const offerResponseSchema = z.object({
    id: nonEmptyString,
    state: offerStateEnum,
    createdAt: isoDateTime,
    offerer: z.object({
        id: nonEmptyString,
        username: z.string(),
    }),
    offered: z.array(collectionItemResponseSchema),
}).meta({ id: "Offer" })

// ============================================================
// RATINGS
// ============================================================

/** POST /users/:userId/ratings */
export const ratingCreateRequestSchema = z.object({
    score: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
}).meta({ id: "RatingCreateRequest" })

export const ratingResponseSchema = z.object({
    id: nonEmptyString,
    reviewerId: nonEmptyString,
    revieweeId: nonEmptyString,
    score: z.number().int().min(1).max(5),
    comment: z.string(),
    createdAt: isoDateTime,
}).meta({ id: "Rating" })

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notificationTypeEnum = z.enum([
    NotificationType.STICKER_AVAILABLE,
    NotificationType.AUCTION_ENDING,
    NotificationType.OFFER_RECEIVED,
    NotificationType.OFFER_ACCEPTED,
    NotificationType.OFFER_REJECTED,
    NotificationType.RATING_RECEIVED,
])

/** GET /users/:userId/notifications?unread=true */
export const notificationQuerySchema = z.object({
    unread: booleanQuery,
})

export const notificationResponseSchema = z.object({
    id: nonEmptyString,
    userId: nonEmptyString,
    type: notificationTypeEnum,
    message: z.string(),
    read: z.boolean(),
    payload: z.record(z.string(), z.unknown()),
    createdAt: isoDateTime,
}).meta({ id: "Notification" })

export const unreadCountResponseSchema = z.object({
    count: nonNegativeInt,
}).meta({ id: "UnreadCount" })

export const markAllReadResponseSchema = z.object({
    marked: nonNegativeInt,
}).meta({ id: "MarkAllRead" })

// ============================================================
// MATCHING
// ============================================================

/** GET /matches?stickerId=&page=&limit= */
export const matchesQuerySchema = paginationQuerySchema.extend({
    stickerId: positiveIntString,
})

export const matchResponseSchema = z.object({
    userId: nonEmptyString,
    username: z.string(),
    email: z.string(),
    quantity: nonNegativeInt,
    reputation: z.number(),
}).meta({ id: "Match" })

export const matchesResponseSchema = paginatedResponseSchema(matchResponseSchema).meta({ id: "Matches" })

export const suggestionResponseSchema = z.object({
    userId: nonEmptyString,
    username: z.string(),
    offerableStickers: z.array(
        z.object({
            number: positiveInt,
            title: z.string(),
        }),
    ),
}).meta({ id: "Suggestion" })

export const suggestionsResponseSchema = paginatedResponseSchema(suggestionResponseSchema).meta({ id: "Suggestions" })
