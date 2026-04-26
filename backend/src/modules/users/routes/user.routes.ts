import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import UserController from "../controllers/user.controller"
import collectionRouter from "../../collection/collection.routes"
import PostController from "../../posts/controllers/post.controller"
import ratingRouter from "../../ratings/routes/rating.routes"
import userNotificationRouter from "../../notifications/routes/user-notification.routes"
import userMatchingRouter from "../../matching/user-matching.routes"

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
