import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import PostController from "./post.controller.ts"
import offerRoutes from "../offers/offer.routes.ts"

const router = Router()
const postController = new PostController()

router.route("/").get(asyncHandler(postController.listPosts)).post(asyncHandler(postController.createPost))

router.patch("/:postId/state", asyncHandler(postController.updatePostState))

router.get("/:postId", asyncHandler(postController.getPostById))

// Nested routes for offers under posts
router.use("/:postId/offers", offerRoutes)

export default router
