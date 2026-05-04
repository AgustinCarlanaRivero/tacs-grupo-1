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
    offerCreateRequestSchema,
    offerResponseSchema,
    offerStateUpdateRequestSchema,
    offerUserQuerySchema,
    offersResponseSchema,
} from "../schemas/offer.schemas"

registry.registerPath({
    method: "get",
    path: "/api/v1/users/{userId}/offers",
    tags: ["Offers"],
    summary: "Listar ofertas del usuario (enviadas / recibidas)",
    security: bearer,
    request: {
        params: z.object({ userId: nonEmptyString }),
        query: offerUserQuerySchema,
    },
    responses: {
        200: jsonResponse("Ofertas paginadas", offersResponseSchema),
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
