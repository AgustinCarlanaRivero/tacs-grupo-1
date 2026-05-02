import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateParams,
    validateQuery,
} from "../../../shared/middleware/validation.middleware"
import {
    offerRoleQuerySchema,
    userIdParamSchema,
} from "../../../shared/validation/schemas"
import OfferController from "../controllers/offer.controller"

const router = Router({ mergeParams: true })
const offerController = new OfferController()

router.route("/").get(
    validateParams(userIdParamSchema),
    validateQuery(offerRoleQuerySchema),
    asyncHandler(offerController.getOffersByUser),
)

export default router
