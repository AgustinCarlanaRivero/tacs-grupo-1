import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import OfferController from "../controllers/offer.controller"

const router = Router({ mergeParams: true })
const offerController = new OfferController()

// Rutas para offers dentro de posts: /posts/:postId/offers
router
    .route("/")
    .get(asyncHandler(offerController.getOffersByPost))
    .post(asyncHandler(offerController.createOffer))

export default router

