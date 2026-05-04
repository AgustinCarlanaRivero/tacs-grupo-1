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
    roleUpdateRequestSchema,
    roleUpdateResponseSchema,
    statsResponseSchema,
} from "../schemas/admin.schemas"
import { userResponseSchema } from "../../users/schemas/user.schemas"

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
