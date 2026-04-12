import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import StickerController from "./sticker.controller.ts"

const router = Router()
const stickerController = new StickerController()

router.route("/").get(asyncHandler(stickerController.getStickers))

router
    .route("/:id")
    .get(asyncHandler(stickerController.getStickerById))

export default router
