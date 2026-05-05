import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import AuthController from "../controllers/auth.controller"

const router = Router()
const controller = new AuthController()

router.get("/me", asyncHandler(controller.getMe))

export default router
