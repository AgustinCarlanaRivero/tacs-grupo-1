import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
} from "../../../shared/middleware/validation.middleware"
import {
    userPostOfferParamsSchema,
    userPostParamsSchema,
} from "../../../shared/validation/common"
import {
    offerCreateRequestSchema,
    offerStateUpdateRequestSchema,
} from "../schemas/offer.schemas"
import OfferController from "../controllers/offer.controller"

const router = Router({ mergeParams: true })
const offerController = new OfferController()

router
    .route("/")
    .get(validateParams(userPostParamsSchema), asyncHandler(offerController.getOffersByPost))
    .post(
        validateParams(userPostParamsSchema),
        validateBody(offerCreateRequestSchema),
        asyncHandler(offerController.createOffer),
    )

router.patch(
    "/:offerId/state",
    validateParams(userPostOfferParamsSchema),
    validateBody(offerStateUpdateRequestSchema),
    asyncHandler(offerController.updateOfferState),
)

export default router
