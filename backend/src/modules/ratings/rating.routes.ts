import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import RatingController from "./rating.controller.ts"

const router = Router({ mergeParams: true })
const ratingController = new RatingController()

router
    .route("/")
    .get(asyncHandler(ratingController.getRatingsByUser))
    .post(asyncHandler(ratingController.createRating))

export default router
