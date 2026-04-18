import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import StickerController from "./sticker.controller.ts"

const router = Router()
const stickerController = new StickerController()

// GET /stickers - Listar figuritas (con filtros ?category=SHINY&team=Argentina)
router.route("/").get(asyncHandler(stickerController.getStickers))

// GET /players - Listar jugadores
router.route("/players").get(asyncHandler(stickerController.getPlayers))

// GET /teams - Listar selecciones nacionales
router.route("/teams").get(asyncHandler(stickerController.getTeams))

// GET /clubs - Listar clubes
router.route("/clubs").get(asyncHandler(stickerController.getClubs))

// GET /stickers/:id - Detalle de figurita
router.route("/:id").get(asyncHandler(stickerController.getStickerById))

export default router
