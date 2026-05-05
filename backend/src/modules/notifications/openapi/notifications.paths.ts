import { z } from "zod"
import { registry } from "../../../infra/openapi/registry"
import {
    bearer,
    errorResponses,
    jsonResponse,
} from "../../../infra/openapi/path-helpers"
import { nonEmptyString } from "../../../shared/validation/common"
import {
    markAllReadResponseSchema,
    notificationQuerySchema,
    notificationResponseSchema,
    unreadCountResponseSchema,
} from "../schemas/notification.schemas"

registry.registerPath({
    method: "get",
    path: "/notifications/unread-count",
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
    path: "/notifications/read-all",
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
    path: "/notifications/{id}/read",
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
    path: "/users/{userId}/notifications",
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
    path: "/users/{userId}/notifications/stream",
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
