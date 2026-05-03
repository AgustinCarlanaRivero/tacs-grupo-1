import { z } from "zod"
import { registry } from "./registry"
import { nonEmptyString, paginationQuerySchema } from "../../shared/validation/common"
import {
    collectionItemAddRequestSchema,
    collectionItemResponseSchema,
    collectionItemUpdateQuantityRequestSchema,
    collectionResponseSchema,
    missingStickerAddRequestSchema,
} from "../../modules/collection/collection.schemas"
import {
    matchesQuerySchema,
    matchesResponseSchema,
    suggestionsResponseSchema,
} from "../../modules/matching/matching.schemas"
import {
    notificationQuerySchema,
    notificationResponseSchema,
    unreadCountResponseSchema,
    markAllReadResponseSchema,
} from "../../modules/notifications/schemas/notification.schemas"
import {
    offerCreateRequestSchema,
    offerResponseSchema,
    offerRoleQuerySchema,
    offerStateUpdateRequestSchema,
} from "../../modules/offers/schemas/offer.schemas"
import {
    postCreateRequestSchema,
    postFilterQuerySchema,
    postResponseSchema,
    postStateUpdateRequestSchema,
} from "../../modules/posts/schemas/post.schemas"
import {
    ratingCreateRequestSchema,
    ratingResponseSchema,
} from "../../modules/ratings/schemas/rating.schemas"
import {
    roleUpdateRequestSchema,
    roleUpdateResponseSchema,
    statsResponseSchema,
} from "../../modules/admin/schemas/admin.schemas"
import {
    stickerFilterQuerySchema,
    stickerResponseSchema,
} from "../../modules/stickers/sticker.schemas"
import {
    userResponseSchema,
    userUpdateRequestSchema,
} from "../../modules/users/schemas/user.schemas"

const bearer = [{ bearerAuth: [] }]

/**
 * Helpers para abreviar el boilerplate de `registerPath`. Mantienen consistencia
 * en cómo se serializan request bodies y respuestas JSON.
 */
function jsonBody<T extends z.ZodTypeAny>(schema: T, description?: string) {
    return {
        description,
        required: true,
        content: { "application/json": { schema } },
    }
}

function jsonResponse<T extends z.ZodTypeAny>(description: string, schema: T) {
    return {
        description,
        content: { "application/json": { schema } },
    }
}

const noContent = (description: string) => ({ description })

const errorResponses = {
    400: noContent("Request inválido (validación Zod)"),
    401: noContent("No autenticado"),
    403: noContent("Sin permisos sobre el recurso"),
    404: noContent("Recurso no encontrado"),
}

// ============================================================
// Health
// ============================================================

registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "Health check",
    responses: {
        200: {
            description: "El servidor está corriendo",
            content: { "text/plain": { schema: z.string().meta({ example: "ok" }) } },
        },
    },
})

// ============================================================
// Auth
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/auth/me",
    tags: ["Auth"],
    summary: "Perfil del usuario autenticado",
    security: bearer,
    responses: {
        200: jsonResponse("Usuario autenticado", userResponseSchema),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

// ============================================================
// Admin
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/admin/stats",
    tags: ["Admin"],
    summary: "Estadísticas agregadas de la plataforma",
    security: bearer,
    responses: {
        200: jsonResponse("Stats", statsResponseSchema),
        401: errorResponses[401],
        403: errorResponses[403],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/admin/users",
    tags: ["Admin"],
    summary: "Listar usuarios (admin)",
    security: bearer,
    responses: {
        200: jsonResponse("Lista de usuarios", z.array(userResponseSchema)),
        401: errorResponses[401],
        403: errorResponses[403],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/admin/users/{userId}",
    tags: ["Admin"],
    summary: "Detalle de usuario (admin)",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        200: jsonResponse("Usuario", userResponseSchema),
        401: errorResponses[401],
        403: errorResponses[403],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/admin/users/{userId}/role",
    tags: ["Admin"],
    summary: "Cambiar rol de un usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(roleUpdateRequestSchema),
    },
    responses: {
        200: jsonResponse("Rol actualizado", roleUpdateResponseSchema),
        ...errorResponses,
    },
})

// ============================================================
// Users
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/users",
    tags: ["Users"],
    summary: "Listar usuarios",
    security: bearer,
    responses: {
        200: jsonResponse("Lista de usuarios", z.array(userResponseSchema)),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}",
    tags: ["Users"],
    summary: "Detalle de usuario",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        200: jsonResponse("Usuario", userResponseSchema),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/users/{userId}",
    tags: ["Users"],
    summary: "Actualizar usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(userUpdateRequestSchema),
    },
    responses: {
        200: jsonResponse("Usuario actualizado", userResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "delete",
    path: "/api/v1/users/{userId}",
    tags: ["Users"],
    summary: "Eliminar usuario",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        204: noContent("Usuario eliminado"),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

// ============================================================
// Collection
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/collection",
    tags: ["Collection"],
    summary: "Obtener la colección del usuario",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        200: jsonResponse("Colección", collectionResponseSchema),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "post",
    path: "/api/v1/users/{userId}/collection/items",
    tags: ["Collection"],
    summary: "Agregar figurita repetida a la colección",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(collectionItemAddRequestSchema),
    },
    responses: {
        201: jsonResponse("Item agregado", collectionItemResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/users/{userId}/collection/items/{stickerId}",
    tags: ["Collection"],
    summary: "Actualizar cantidad de un item",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, stickerId: nonEmptyString }),
        body: jsonBody(collectionItemUpdateQuantityRequestSchema),
    },
    responses: {
        200: jsonResponse("Item actualizado", collectionItemResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "delete",
    path: "/api/v1/users/{userId}/collection/items/{stickerId}",
    tags: ["Collection"],
    summary: "Eliminar item de la colección",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, stickerId: nonEmptyString }),
    },
    responses: {
        204: noContent("Item eliminado"),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "post",
    path: "/api/v1/users/{userId}/collection/missing",
    tags: ["Collection"],
    summary: "Marcar figurita como faltante",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(missingStickerAddRequestSchema),
    },
    responses: {
        201: jsonResponse("Faltante agregado", stickerResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "delete",
    path: "/api/v1/users/{userId}/collection/missing/{stickerId}",
    tags: ["Collection"],
    summary: "Quitar figurita de los faltantes",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, stickerId: nonEmptyString }),
    },
    responses: {
        204: noContent("Faltante eliminado"),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

// ============================================================
// Posts
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/posts",
    tags: ["Posts"],
    summary: "Listar publicaciones del usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: postFilterQuerySchema,
    },
    responses: {
        200: jsonResponse("Lista de publicaciones", z.array(postResponseSchema)),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "post",
    path: "/api/v1/users/{userId}/posts",
    tags: ["Posts"],
    summary: "Crear publicación",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(postCreateRequestSchema),
    },
    responses: {
        201: jsonResponse("Publicación creada", postResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/posts/{postId}",
    tags: ["Posts"],
    summary: "Detalle de publicación",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, postId: nonEmptyString }),
    },
    responses: {
        200: jsonResponse("Publicación", postResponseSchema),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/users/{userId}/posts/{postId}/state",
    tags: ["Posts"],
    summary: "Cambiar estado de la publicación",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, postId: nonEmptyString }),
        body: jsonBody(postStateUpdateRequestSchema),
    },
    responses: {
        200: jsonResponse("Publicación actualizada", postResponseSchema),
        ...errorResponses,
    },
})

// ============================================================
// Offers
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/offers",
    tags: ["Offers"],
    summary: "Listar ofertas del usuario (enviadas / recibidas)",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: offerRoleQuerySchema,
    },
    responses: {
        200: jsonResponse("Ofertas", z.array(offerResponseSchema)),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/posts/{postId}/offers",
    tags: ["Offers"],
    summary: "Listar ofertas de una publicación",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, postId: nonEmptyString }),
    },
    responses: {
        200: jsonResponse("Ofertas", z.array(offerResponseSchema)),
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "post",
    path: "/api/v1/users/{userId}/posts/{postId}/offers",
    tags: ["Offers"],
    summary: "Crear oferta para una publicación",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString, postId: nonEmptyString }),
        body: jsonBody(offerCreateRequestSchema),
    },
    responses: {
        201: jsonResponse("Oferta creada", offerResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/users/{userId}/posts/{postId}/offers/{offerId}/state",
    tags: ["Offers"],
    summary: "Aceptar / rechazar / cancelar una oferta",
    security: bearer,
    request: {
        params: z.object({
            userId: nonEmptyString,
            postId: nonEmptyString,
            offerId: nonEmptyString,
        }),
        body: jsonBody(offerStateUpdateRequestSchema),
    },
    responses: {
        200: jsonResponse("Oferta actualizada", offerResponseSchema),
        ...errorResponses,
    },
})

// ============================================================
// Ratings
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/ratings",
    tags: ["Ratings"],
    summary: "Listar ratings recibidos por el usuario",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        200: jsonResponse("Ratings", z.array(ratingResponseSchema)),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "post",
    path: "/api/v1/users/{userId}/ratings",
    tags: ["Ratings"],
    summary: "Calificar a un usuario tras un intercambio",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        body: jsonBody(ratingCreateRequestSchema),
    },
    responses: {
        201: jsonResponse("Rating creado", ratingResponseSchema),
        ...errorResponses,
    },
})

// ============================================================
// Stickers (catálogo público)
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/stickers",
    tags: ["Stickers"],
    summary: "Listar figuritas del catálogo (con filtros)",
    request: { query: stickerFilterQuerySchema },
    responses: {
        200: jsonResponse("Figuritas", z.array(stickerResponseSchema)),
        400: errorResponses[400],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/stickers/{id}",
    tags: ["Stickers"],
    summary: "Detalle de una figurita",
    request: { params: z.object({ id: nonEmptyString }) },
    responses: {
        200: jsonResponse("Figurita", stickerResponseSchema),
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/stickers/players",
    tags: ["Stickers"],
    summary: "Listar jugadores",
    responses: {
        200: jsonResponse("Jugadores", z.array(z.unknown())),
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/stickers/teams",
    tags: ["Stickers"],
    summary: "Listar selecciones nacionales",
    responses: {
        200: jsonResponse("Selecciones", z.array(z.object({ name: z.string() }))),
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/stickers/clubs",
    tags: ["Stickers"],
    summary: "Listar clubes",
    responses: {
        200: jsonResponse("Clubes", z.array(z.object({ name: z.string() }))),
    },
})

// ============================================================
// Notifications
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/notifications/unread-count",
    tags: ["Notifications"],
    summary: "Cantidad de notificaciones no leídas del usuario autenticado",
    security: bearer,
    responses: {
        200: jsonResponse("Conteo", unreadCountResponseSchema),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/notifications/read-all",
    tags: ["Notifications"],
    summary: "Marcar todas las notificaciones como leídas",
    security: bearer,
    responses: {
        200: jsonResponse("Marcadas como leídas", markAllReadResponseSchema),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "patch",
    path: "/api/v1/notifications/{id}/read",
    tags: ["Notifications"],
    summary: "Marcar una notificación como leída",
    security: bearer,
    request: { params: z.object({ id: nonEmptyString }) },
    responses: {
        200: jsonResponse("Notificación", notificationResponseSchema),
        401: errorResponses[401],
        403: errorResponses[403],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/notifications",
    tags: ["Notifications"],
    summary: "Listar notificaciones del usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: notificationQuerySchema,
    },
    responses: {
        200: jsonResponse("Notificaciones", z.array(notificationResponseSchema)),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/notifications/stream",
    tags: ["Notifications"],
    summary: "Stream SSE de notificaciones en vivo",
    description:
        "Server-Sent Events. El cliente se suscribe y recibe eventos a medida que se generan notificaciones para el usuario.",
    security: bearer,
    request: { params: z.object({ userId: nonEmptyString }) },
    responses: {
        200: {
            description: "Stream de eventos",
            content: { "text/event-stream": { schema: z.string() } },
        },
        401: errorResponses[401],
        403: errorResponses[403],
    },
})

// ============================================================
// Matching
// ============================================================

registry.registerPath({
    method: "get",
    path: "/api/v1/matches",
    tags: ["Matching"],
    summary: "Buscar usuarios que tienen una figurita específica",
    security: bearer,
    request: { query: matchesQuerySchema },
    responses: {
        200: jsonResponse("Matches paginados", matchesResponseSchema),
        ...errorResponses,
    },
})

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/suggestions",
    tags: ["Matching"],
    summary: "Sugerencias de intercambio para el usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: paginationQuerySchema,
    },
    responses: {
        200: jsonResponse("Sugerencias paginadas", suggestionsResponseSchema),
        ...errorResponses,
    },
})
