/**
 * Shim de tipos para el subpath ESM `dist/index.mjs`. El `package.json` del
 * paquete sólo declara `main`/`module`, sin `exports`, por lo que TypeScript
 * no asocia los tipos del entrypoint a ese path. Re-exportamos los tipos
 * públicos para que el import del runtime (`/dist/index.mjs`) tipee igual
 * que el entrypoint estándar.
 */
declare module "@asteasolutions/zod-to-openapi/dist/index.mjs" {
    export * from "@asteasolutions/zod-to-openapi"
}
