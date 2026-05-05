import { Router } from "express"
import { asyncHandler } from "../../../shared/middleware/async-handler"
import {
    validateBody,
    validateParams,
} from "../../../shared/middleware/validation.middleware"
import {
    userIdParamSchema,
    userStickerParamsSchema,
} from "../../../shared/validation/common"
import {
    collectionItemAddRequestSchema,
    collectionItemUpdateQuantityRequestSchema,
    missingStickerAddRequestSchema,
} from "../schemas/collection.schemas"
import CollectionController from "../controllers/collection.controller"

// IMPORTANTE: mergeParams permite leer el :userId del router padre
const router = Router({ mergeParams: true })
const collectionController = new CollectionController()

// Base: /users/:userId/collection

router
    .route("/")
    .get(validateParams(userIdParamSchema), asyncHandler(collectionController.getCollection))

router
    .route("/items")
    .post(
        validateParams(userIdParamSchema),
        validateBody(collectionItemAddRequestSchema),
        asyncHandler(collectionController.addCollectionItem),
    )

router
    .route("/items/:stickerId")
    .patch(
        validateParams(userStickerParamsSchema),
        validateBody(collectionItemUpdateQuantityRequestSchema),
        asyncHandler(collectionController.updateCollectionItemQuantity),
    )
    .delete(
        validateParams(userStickerParamsSchema),
        asyncHandler(collectionController.removeCollectionItem),
    )

router
    .route("/missing")
    .post(
        validateParams(userIdParamSchema),
        validateBody(missingStickerAddRequestSchema),
        asyncHandler(collectionController.addMissingSticker),
    )

router
    .route("/missing/:stickerId")
    .delete(
        validateParams(userStickerParamsSchema),
        asyncHandler(collectionController.removeMissingSticker),
    )

export default router
