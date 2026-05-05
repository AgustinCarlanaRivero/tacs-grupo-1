import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import { userIdParamSchema } from "../../../shared/validation/common"
import { ratingCreateRequestSchema, ratingQuerySchema } from "../schemas/rating.schemas"
import RatingController from "../controllers/rating.controller"

const router = Router({ mergeParams: true })
const ratingController = new RatingController()

router
    .route("/")
    .get(
        validateParams(userIdParamSchema),
        validateQuery(ratingQuerySchema),
        asyncHandler(ratingController.getRatingsByUser),
    )
    .post(
        validateParams(userIdParamSchema),
        validateBody(ratingCreateRequestSchema),
        asyncHandler(ratingController.createRating),
    )

export default router
