import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import AuthController from "./auth.controller.ts"

const router = Router()
const controller = new AuthController()

router.get("/me", asyncHandler(controller.getMe))

export default router
