import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import NotificationController from "./notification.controller.ts"

const router = Router({ mergeParams: true })
const notificationController = new NotificationController()

router.get("/", asyncHandler(notificationController.getNotificationsByUser))

export default router
