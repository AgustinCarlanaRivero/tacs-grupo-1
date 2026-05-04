import { z } from "zod"
import { registry } from "../../../infra/openapi/registry"
import { errorResponses, jsonResponse } from "../../../infra/openapi/path-helpers"
import { nonEmptyString } from "../../../shared/validation/common"
import { stickerFilterQuerySchema, stickerResponseSchema } from "../schemas/sticker.schemas"

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
