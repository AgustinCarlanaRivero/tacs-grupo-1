import { z } from "zod"
import { registry } from "../../../infra/openapi/registry"
import { bearer, errorResponses, jsonResponse } from "../../../infra/openapi/path-helpers"
import { nonEmptyString, paginationQuerySchema } from "../../../shared/validation/common"
import {
    matchesQuerySchema,
    matchesResponseSchema,
    suggestionsResponseSchema,
} from "../schemas/matching.schemas"

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
