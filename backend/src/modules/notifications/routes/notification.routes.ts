import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import { validateParams } from "../../../shared/middleware/validation.middleware"
import { notificationIdParamSchema } from "../../../shared/validation/schemas"
import NotificationController from "../controllers/notification.controller"

const router = Router()
const controller = new NotificationController()

router.get("/unread-count", asyncHandler(controller.getUnreadCount))
router.patch("/read-all", asyncHandler(controller.markAllAsRead))
router.patch(
    "/:id/read",
    validateParams(notificationIdParamSchema),
    asyncHandler(controller.markAsRead),
)

export default router
