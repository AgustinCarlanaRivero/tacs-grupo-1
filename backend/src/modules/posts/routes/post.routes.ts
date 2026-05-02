import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import {
    postCreateRequestSchema,
    postFilterQuerySchema,
    postStateUpdateRequestSchema,
    userIdParamSchema,
    userPostParamsSchema,
} from "../../../shared/validation/schemas"
import PostController from "../controllers/post.controller"
import offerPostRoutes from "../../offers/routes/offer-post.routes"

const router = Router({ mergeParams: true })
const postController = new PostController()

router.route("/")
    .get(
        validateParams(userIdParamSchema),
        validateQuery(postFilterQuerySchema),
        asyncHandler(postController.listPostsByOwner),
    )
    .post(
        validateParams(userIdParamSchema),
        validateBody(postCreateRequestSchema),
        asyncHandler(postController.createPost),
    )

router.get(
    "/:postId",
    validateParams(userPostParamsSchema),
    asyncHandler(postController.getPostById),
)

router.patch(
    "/:postId/state",
    validateParams(userPostParamsSchema),
    validateBody(postStateUpdateRequestSchema),
    asyncHandler(postController.updatePostState),
)

router.use("/:postId/offers", offerPostRoutes)

export default router
