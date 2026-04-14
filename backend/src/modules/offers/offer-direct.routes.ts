import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import OfferController from "./offer.controller.ts"

const router = Router()
const offerController = new OfferController()

// Rutas directas para offers: /offers/:offerId
router.patch("/:offerId/state", asyncHandler(offerController.updateOfferState))

router.delete("/:offerId", asyncHandler(offerController.deleteOffer))

export default router
