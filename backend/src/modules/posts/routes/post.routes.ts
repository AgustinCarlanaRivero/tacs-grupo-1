import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/async-handler";
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware";
import {
    userIdParamSchema,
    userPostParamsSchema,
} from "../../../shared/validation/common";
import offerPostRoutes from "../../offers/routes/offer-post.routes";
import PostController from "../controllers/post.controller";
import {
    postCreateRequestSchema,
    postFilterQuerySchema,
    postStateUpdateRequestSchema,
} from "../schemas/post.schemas";

const router = Router({ mergeParams: true });
const postController = new PostController();

router
    .route("/")
    .get(
        validateParams(userIdParamSchema),
        validateQuery(postFilterQuerySchema),
        asyncHandler(postController.listPostsByOwner),
    )
    .post(
        validateParams(userIdParamSchema),
        validateBody(postCreateRequestSchema),
        asyncHandler(postController.createPost),
    );

router.get(
    "/:postId",
    validateParams(userPostParamsSchema),
    asyncHandler(postController.getPostById),
);

router.delete(
    "/:postId",
    validateParams(userPostParamsSchema),
    asyncHandler(postController.deletePost),
);

router.patch(
    "/:postId/state",
    validateParams(userPostParamsSchema),
    validateBody(postStateUpdateRequestSchema),
    asyncHandler(postController.updatePostState),
);

router.use("/:postId/offers", offerPostRoutes);

export default router;
