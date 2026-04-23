import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import NotificationController from "../controllers/notification.controller"

const router = Router()
const controller = new NotificationController()

router.get("/unread-count", asyncHandler(controller.getUnreadCount))
router.patch("/read-all", asyncHandler(controller.markAllAsRead))
router.patch("/:id/read", asyncHandler(controller.markAsRead))

export default router
