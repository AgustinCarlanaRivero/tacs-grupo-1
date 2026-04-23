import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import RatingController from "../controllers/rating.controller"

const router = Router({ mergeParams: true })
const ratingController = new RatingController()

router
    .route("/")
    .get(asyncHandler(ratingController.getRatingsByUser))
    .post(asyncHandler(ratingController.createRating))

export default router
