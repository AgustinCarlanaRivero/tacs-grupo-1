import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import { validateBody } from "../../../shared/middleware/validation.middleware"
import { requireAdmin } from "../middleware/admin.middleware"
import AdminController, { updateRoleSchema } from "../controllers/admin.controller"

const router = Router()
const controller = new AdminController()

router.use(requireAdmin)

router.get("/stats", asyncHandler(controller.getStats))
router.get("/users", asyncHandler(controller.getUsers))
router.get("/users/:userId", asyncHandler(controller.getUserById))
router.patch(
    "/users/:userId/role",
    validateBody(updateRoleSchema),
    asyncHandler(controller.updateUserRole),
)

export default router
