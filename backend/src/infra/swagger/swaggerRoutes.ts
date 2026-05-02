import { Router } from "express"
import * as swaggerUi from "swagger-ui-express"
import { openApiDocument } from "../openapi/document"

const router = Router()

router.use("/", swaggerUi.serve)
router.get("/", swaggerUi.setup(openApiDocument))

/**
 * Expone el documento OpenAPI crudo (JSON) para que clientes externos
 * (Postman, generadores de SDK, etc.) puedan importarlo.
 */
router.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument)
})

export default router
