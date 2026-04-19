import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler.ts"
import NotificationController from "../controllers/notification.controller.ts"

const router = Router({ mergeParams: true })
const controller = new NotificationController()

router.get("/", asyncHandler(controller.getNotificationsByUser))
router.get("/stream", controller.stream)

export default router
