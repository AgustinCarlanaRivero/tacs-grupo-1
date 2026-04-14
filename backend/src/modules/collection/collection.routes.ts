import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import CollectionController from "./collection.controller.ts"

// IMPORTANTE: mergeParams permite leer el :userId del router padre
const router = Router({ mergeParams: true })
const collectionController = new CollectionController()

// Base: /users/:userId/collection

router
    .route("/")
    .get(asyncHandler(collectionController.getCollection))

router
    .route("/items")
    .post(asyncHandler(collectionController.addCollectionItem))

router
    .route("/items/:stickerId")
    .patch(asyncHandler(collectionController.updateCollectionItemQuantity))
    .delete(asyncHandler(collectionController.removeCollectionItem))

router
    .route("/missing")
    .post(asyncHandler(collectionController.addMissingSticker))

router
    .route("/missing/:stickerId")
    .delete(asyncHandler(collectionController.removeMissingSticker))

export default router