import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import NotificationController from "../controllers/notification.controller"

const router = Router({ mergeParams: true })
const controller = new NotificationController()

router.get("/", asyncHandler(controller.getNotificationsByUser))
router.get("/stream", controller.stream)

export default router
