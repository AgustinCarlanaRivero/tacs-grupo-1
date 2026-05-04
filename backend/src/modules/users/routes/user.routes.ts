import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import { userIdParamSchema } from "../../../shared/validation/common"
import { userQuerySchema, userUpdateRequestSchema } from "../schemas/user.schemas"
import UserController from "../controllers/user.controller"
import collectionRouter from "../../collection/collection.routes"
import postRouter from "../../posts/routes/post.routes"
import offerUserRouter from "../../offers/routes/offer-user.routes"
import ratingRouter from "../../ratings/routes/rating.routes"
import userNotificationRouter from "../../notifications/routes/user-notification.routes"
import userMatchingRouter from "../../matching/user-matching.routes"

const router = Router()
const userController = new UserController()

router.route("/")
    .get(validateQuery(userQuerySchema), asyncHandler(userController.getUsers))

router.use("/:userId/collection", collectionRouter)
router.use("/:userId/posts", postRouter)
router.use("/:userId/offers", offerUserRouter)
router.use("/:userId/ratings", ratingRouter)
router.use("/:userId/notifications", userNotificationRouter)
router.use("/:userId/suggestions", userMatchingRouter)

router.route("/:userId")
    .get(validateParams(userIdParamSchema), asyncHandler(userController.getUserById))
    .patch(
        validateParams(userIdParamSchema),
        validateBody(userUpdateRequestSchema),
        asyncHandler(userController.updateUser),
    )
    .delete(validateParams(userIdParamSchema), asyncHandler(userController.deleteUser))

export default router
