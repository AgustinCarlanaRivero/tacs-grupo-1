import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import { userIdParamSchema } from "../../../shared/validation/common"
import { notificationQuerySchema } from "../schemas/notification.schemas"
import NotificationController from "../controllers/notification.controller"

const router = Router({ mergeParams: true })
const controller = new NotificationController()

router.get(
    "/",
    validateParams(userIdParamSchema),
    validateQuery(notificationQuerySchema),
    asyncHandler(controller.getNotificationsByUser),
)
router.get(
    "/stream",
    validateParams(userIdParamSchema),
    controller.stream,
)

export default router
