import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import NotificationController from "./notification.controller.ts"

const router = Router()
const notificationController = new NotificationController()

router.patch("/:id/read", asyncHandler(notificationController.markNotificationAsRead))

export default router
