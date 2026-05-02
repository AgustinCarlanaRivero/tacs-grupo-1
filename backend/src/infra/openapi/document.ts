import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registry } from "./registry"
// El import side-effect dispara el `registerPath` de cada endpoint.
import "./paths"

/**
 * Genera el documento OpenAPI 3.0 a partir de los schemas Zod y los paths
 * registrados. Se construye una sola vez al cargar el módulo y se exporta
 * como objeto JS para que `swagger-ui-express` lo sirva sin necesidad de
 * leer un YAML del filesystem.
 */
export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
        title: "TACS Grupo 1 API",
        version: "1.0.0",
        description: "API del TP de TACS — Intercambio de figuritas del Mundial",
    },
    servers: [
        { url: "http://localhost:8000", description: "Local" },
    ],
    tags: [
        { name: "Health" },
        { name: "Auth" },
        { name: "Admin" },
        { name: "Users" },
        { name: "Collection" },
        { name: "Posts" },
        { name: "Offers" },
        { name: "Ratings" },
        { name: "Stickers" },
        { name: "Notifications" },
        { name: "Matching" },
    ],
})
