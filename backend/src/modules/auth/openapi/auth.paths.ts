import { registry } from "../../../infra/openapi/registry"
import { bearer, errorResponses, jsonResponse } from "../../../infra/openapi/path-helpers"
import { userResponseSchema } from "../../users/schemas/user.schemas"

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
