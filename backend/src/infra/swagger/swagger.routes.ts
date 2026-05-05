import { Router } from "express"
import {
    getOpenApiDocument,
    swaggerUiServe,
    swaggerUiSetup,
} from "./swagger.controller"

const router = Router()

router.use("/", swaggerUiServe)
router.get("/", swaggerUiSetup)
router.get("/openapi.json", getOpenApiDocument)

export default router
