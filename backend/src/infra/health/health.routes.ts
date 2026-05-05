import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler"
import HealthController from "./health.controller"

const router = Router()
const healthController = new HealthController()

router
    .route("/")
    .get(asyncHandler(healthController.healthCheck))

export default router
