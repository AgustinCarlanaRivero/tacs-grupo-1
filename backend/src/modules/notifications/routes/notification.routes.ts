import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler.ts"
import NotificationController from "../controllers/notification.controller.ts"

const router = Router()
const controller = new NotificationController()

router.get("/unread-count", asyncHandler(controller.getUnreadCount))
router.patch("/read-all", asyncHandler(controller.markAllAsRead))
router.patch("/:id/read", asyncHandler(controller.markAsRead))

export default router
