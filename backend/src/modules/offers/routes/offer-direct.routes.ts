import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import OfferController from "../controllers/offer.controller"

const router = Router()
const offerController = new OfferController()

// Rutas directas para offers: /offers/:offerId
router.patch("/:offerId/state", asyncHandler(offerController.updateOfferState))

router.delete("/:offerId", asyncHandler(offerController.deleteOffer))

export default router
