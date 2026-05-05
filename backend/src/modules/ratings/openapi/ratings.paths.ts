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
    ratingCreateRequestSchema,
    ratingQuerySchema,
    ratingResponseSchema,
    ratingsResponseSchema,
} from "../schemas/rating.schemas"

registry.registerPath({
    method: "get",
    path: "/users/{userId}/ratings",
    tags: ["Ratings"],
    summary: "Listar ratings recibidos por el usuario",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: ratingQuerySchema,
    },
    responses: {
        200: jsonResponse("Ratings paginados", ratingsResponseSchema),
        401: errorResponses[401],
    },
})

registry.registerPath({
    method: "post",
    path: "/users/{userId}/ratings",
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
