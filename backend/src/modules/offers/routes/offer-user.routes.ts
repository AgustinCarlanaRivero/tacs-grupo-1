import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import OfferController from "../controllers/offer.controller"

const router = Router({ mergeParams: true })
const offerController = new OfferController()

router.route("/").get(asyncHandler(offerController.getOffersByUser))

export default router