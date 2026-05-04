import { z } from "zod"
import { registry } from "../../../infra/openapi/registry"
import {
    bearer,
    errorResponses,
    jsonBody,
    jsonResponse,
    noContent,
} from "../../../infra/openapi/path-helpers"
import { nonEmptyString } from "../../../shared/validation/common"
import {
    collectionItemAddRequestSchema,
    collectionItemResponseSchema,
    collectionItemUpdateQuantityRequestSchema,
    collectionResponseSchema,
    missingStickerAddRequestSchema,
} from "../schemas/collection.schemas"
import { stickerResponseSchema } from "../../stickers/schemas/sticker.schemas"

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
