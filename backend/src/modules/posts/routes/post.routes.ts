import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import PostController from "../controllers/post.controller"
import offerPostRoutes from "../../offers/routes/offer-post.routes"

const router = Router({ mergeParams: true })
const postController = new PostController()

router.route("/")
    .get(asyncHandler(postController.listPostsByOwner))
    .post(asyncHandler(postController.createPost))

router.get("/:postId", asyncHandler(postController.getPostById))

router.patch("/:postId/state", asyncHandler(postController.updatePostState))

router.use("/:postId/offers", offerPostRoutes)

export default router
