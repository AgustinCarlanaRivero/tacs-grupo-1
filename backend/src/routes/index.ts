import { Router } from "express"
import userRoutes from "../modules/users/user.routes.ts"
import stickersRoutes from "../modules/stickers/sticker.routes.ts"

const router = Router()

//router.use("/health", healthRoutes)
router.use("/users", userRoutes)
router.use("/stickers", stickersRoutes)

export default router

