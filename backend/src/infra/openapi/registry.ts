// IMPORTANTE: importamos directamente el build ESM (`.mjs`) porque el
// `package.json` de zod-to-openapi no expone `exports` y Node por defecto
// resuelve el `main` CJS, lo que termina cargando dos copias de zod.
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi/dist/index.mjs"

/**
 * Registro central de definiciones OpenAPI. No registramos schemas con
 * `registry.register()` porque en Zod 4 las clases (`ZodObject`, `ZodString`,
 * etc.) ya no extienden `ZodType.prototype`, por lo que el parche que
 * `extendZodWithOpenApi` aplica al prototipo nunca llega a las instancias y
 * `.openapi()` queda sin definir. En su lugar, cada schema "público" usa
 * `.meta({ id: "Nombre" })` (API nativa de Zod 4) en los `<modulo>.schemas.ts`.
 * El generador respeta ese id como nombre del componente y emite `$ref` cuando
 * el schema se referencia en una respuesta o request.
 */
export const registry = new OpenAPIRegistry()

/**
 * Define el esquema de seguridad bearer (Auth0 JWT). Las rutas que requieren
 * token lo declaran en su definición de path con `security: [{ bearerAuth: [] }]`.
 */
registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Access token emitido por Auth0 (`Authorization: Bearer <token>`)",
})
