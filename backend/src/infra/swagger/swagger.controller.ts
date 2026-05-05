import type { Request, Response } from "express"
import * as swaggerUi from "swagger-ui-express"
import { openApiDocument } from "../openapi/document"

export const swaggerUiServe = swaggerUi.serve
export const swaggerUiSetup = swaggerUi.setup(openApiDocument)

/**
 * Expone el documento OpenAPI crudo (JSON) para que clientes externos
 * (Postman, generadores de SDK, etc.) puedan importarlo.
 */
export const getOpenApiDocument = (_req: Request, res: Response) => {
    res.json(openApiDocument)
}
