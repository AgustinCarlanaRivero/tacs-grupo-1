/**
 * Registro central de OpenAPI y definicion de seguridad bearer.
 * Se importa el build ESM para evitar duplicar instancias de Zod en runtime.
 */
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi/dist/index.mjs"

/**
 * Registro central de definiciones OpenAPI.
 * No usamos `registry.register()` porque en Zod 4 las clases no extienden
 * `ZodType.prototype` y el parche `extendZodWithOpenApi` no aplica. En su lugar,
 * los schemas publicos usan `.meta({ id: "Nombre" })` en los `<modulo>.schemas.ts`.
 * El generador respeta ese id y emite `$ref` cuando corresponde.
 */
export const registry = new OpenAPIRegistry()

/**
 * Define el esquema de seguridad bearer (Auth0 JWT).
 * Las rutas protegidas lo declaran con `security: [{ bearerAuth: [] }]`.
 */
registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Access token emitido por Auth0 (`Authorization: Bearer <token>`)",
})
