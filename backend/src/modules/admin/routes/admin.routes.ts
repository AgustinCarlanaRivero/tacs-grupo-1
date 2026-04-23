import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import { requireAdmin } from "../middleware/admin.middleware"
import AdminController from "../controllers/admin.controller"

const router = Router()
const controller = new AdminController()

router.use(requireAdmin)

router.get("/stats", asyncHandler(controller.getStats))
router.get("/users", asyncHandler(controller.getUsers))
router.get("/users/:userId", asyncHandler(controller.getUserById))
router.patch("/users/:userId/role", asyncHandler(controller.updateUserRole))

export default router
