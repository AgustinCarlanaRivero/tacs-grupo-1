import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/async-handler";
import { validateQuery } from "../../../shared/middleware/validation.middleware";
import PostController from "../controllers/post.controller";
import { postFilterQuerySchema } from "../schemas/post.schemas";

const router = Router();
const postController = new PostController();

router.get(
    "/",
    validateQuery(postFilterQuerySchema),
    asyncHandler(postController.listPosts),
);

export default router;
