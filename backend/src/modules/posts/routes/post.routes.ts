import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import PostController from "../controllers/post.controller"
import offerRoutes from "../../offers/routes/offer.routes"

const router = Router()
const postController = new PostController()

router.route("/").get(asyncHandler(postController.listPosts)).post(asyncHandler(postController.createPost))

router.patch("/:postId/state", asyncHandler(postController.updatePostState))

router.get("/:postId", asyncHandler(postController.getPostById))

// Nested routes for offers under posts
router.use("/:postId/offers", offerRoutes)

export default router
