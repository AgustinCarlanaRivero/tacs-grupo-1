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
    telegramLinkRequestSchema,
    telegramLinkResponseSchema,
    userQuerySchema,
    userResponseSchema,
    usersResponseSchema,
    userUpdateRequestSchema,
} from "../schemas/user.schemas"

registry.registerPath({
    method: "get",
    path: "/users",
    tags: ["Users"],
    summary: "Listar usuarios",
    security: bearer,
    request: {
        query: userQuerySchema,
    },
    responses: {
        200: jsonResponse("Usuarios paginados", usersResponseSchema),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "post",
    path: "/users/telegram/link",
    tags: ["Users"],
    summary: "Vincular chat de Telegram a la cuenta",
    security: bearer,
    request: { body: jsonBody(telegramLinkRequestSchema) },
    responses: {
        200: jsonResponse("Vínculo creado", telegramLinkResponseSchema),
        400: errorResponses[400],
        401: errorResponses[401],
        404: errorResponses[404],
    },
})

registry.registerPath({
    method: "get",
    path: "/users/{userId}",
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
    path: "/users/{userId}",
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
    path: "/users/{userId}",
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
