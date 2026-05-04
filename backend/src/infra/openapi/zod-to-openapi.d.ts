/**
 * Shim de tipos para el subpath ESM `dist/index.mjs`.
 * Sin esto, TypeScript no resuelve tipos al importar el build ESM usado en runtime.
 */
declare module "@asteasolutions/zod-to-openapi/dist/index.mjs" {
    export * from "@asteasolutions/zod-to-openapi"
}
