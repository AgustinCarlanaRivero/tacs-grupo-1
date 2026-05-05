/**
 * Construye el documento OpenAPI V3 de la API.
 * Importa "./paths" por side-effect para registrar rutas antes de generar el documento.
 */
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { registry } from "./registry"
import "./paths"

/**
 * Documento OpenAPI listo para Swagger UI y /openapi.json.
 * Se genera una sola vez al cargar el modulo.
 */
export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: {
        title: "TACS Grupo 1 API",
        version: "1.0.0",
        description: "API del TP de TACS — Intercambio de figuritas del Mundial",
    },
    servers: [
        { url: "http://localhost:3000", description: "Local" },
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
