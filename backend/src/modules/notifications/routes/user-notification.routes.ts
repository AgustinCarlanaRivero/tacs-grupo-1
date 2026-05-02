import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import {
    notificationQuerySchema,
    userIdParamSchema,
} from "../../../shared/validation/schemas"
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
