import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
} from "../../../shared/middleware/validation.middleware"
import {
    ratingCreateRequestSchema,
    userIdParamSchema,
} from "../../../shared/validation/schemas"
import RatingController from "../controllers/rating.controller"

const router = Router({ mergeParams: true })
const ratingController = new RatingController()

router
    .route("/")
    .get(
        validateParams(userIdParamSchema),
        asyncHandler(ratingController.getRatingsByUser),
    )
    .post(
        validateParams(userIdParamSchema),
        validateBody(ratingCreateRequestSchema),
        asyncHandler(ratingController.createRating),
    )

export default router
