import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import UserController from "./user.controller.ts"
import collectionRouter from "../collection/collection.routes.ts"
import PostController from "../posts/post.controller.ts"
import ratingRouter from "../ratings/rating.routes.ts"
import userNotificationRouter from "../notifications/routes/user-notification.routes.ts"
import userMatchingRouter from "../matching/user-matching.routes.ts"

const router = Router()
const userController = new UserController()
const postController = new PostController()

router.route("/").get(asyncHandler(userController.getUsers))

router.use("/:userId/collection", collectionRouter)
router.get("/:userId/posts", asyncHandler(postController.listPostsByOwner))
router.use("/:userId/ratings", ratingRouter)
router.use("/:userId/notifications", userNotificationRouter)
router.use("/:userId/suggestions", userMatchingRouter)

router
    .route("/:id")
    .get(asyncHandler(userController.getUserById))
    .patch(asyncHandler(userController.updateUser))
    .delete(asyncHandler(userController.deleteUser))

export default router
