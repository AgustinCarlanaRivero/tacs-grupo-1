import { z } from "zod"
import { registry } from "../../../infra/openapi/registry"
import {
    bearer,
    errorResponses,
    jsonBody,
    jsonResponse,
} from "../../../infra/openapi/path-helpers"
import { nonEmptyString } from "../../../shared/validation/common"
import {
    postCreateRequestSchema,
    postFilterQuerySchema,
    postListResponseSchema,
    postResponseSchema,
    postStateUpdateRequestSchema,
} from "../schemas/post.schemas"

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
        200: jsonResponse("Publicaciones paginadas", postListResponseSchema),
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
