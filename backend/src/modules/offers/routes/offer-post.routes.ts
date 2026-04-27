import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import OfferController from "../controllers/offer.controller"

const router = Router({ mergeParams: true })
const offerController = new OfferController()

router
    .route("/")
    .get(asyncHandler(offerController.getOffersByPost))
    .post(asyncHandler(offerController.createOffer))

router.patch("/:offerId/state", asyncHandler(offerController.updateOfferState))

export default router