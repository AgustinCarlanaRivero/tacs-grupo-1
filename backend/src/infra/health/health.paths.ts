import { z } from "zod"
import { registry } from "../openapi/registry"

registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "Health check",
    responses: {
        200: {
            description: "El servidor está corriendo",
            content: { "text/plain": { schema: z.string().meta({ example: "ok" }) } },
        },
    },
})
