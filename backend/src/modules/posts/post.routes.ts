import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import PostController from "./post.controller.ts"

const router = Router()
const postController = new PostController()

router.route("/").get(asyncHandler(postController.listPosts)).post(asyncHandler(postController.createPost))

router.patch("/:postId/state", asyncHandler(postController.updatePostState))

router.get("/:postId", asyncHandler(postController.getPostById))

export default router
