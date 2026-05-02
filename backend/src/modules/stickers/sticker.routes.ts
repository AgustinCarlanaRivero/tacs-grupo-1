import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler"
import {
    validateParams,
    validateQuery,
} from "../../shared/middleware/validation.middleware"
import {
    stickerFilterQuerySchema,
    stickerNumericIdParamSchema,
} from "../../shared/validation/schemas"
import StickerController from "./sticker.controller"

const router = Router()
const stickerController = new StickerController()

// GET /stickers - Listar figuritas (con filtros ?type=SHINY&state=NEW&team=Argentina)
router.route("/").get(
    validateQuery(stickerFilterQuerySchema),
    asyncHandler(stickerController.getStickers),
)

// GET /players - Listar jugadores
router.route("/players").get(asyncHandler(stickerController.getPlayers))

// GET /teams - Listar selecciones nacionales
router.route("/teams").get(asyncHandler(stickerController.getTeams))

// GET /clubs - Listar clubes
router.route("/clubs").get(asyncHandler(stickerController.getClubs))

// GET /stickers/:id - Detalle de figurita
router.route("/:id").get(
    validateParams(stickerNumericIdParamSchema),
    asyncHandler(stickerController.getStickerById),
)

export default router
