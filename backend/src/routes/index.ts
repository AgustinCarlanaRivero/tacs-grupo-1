import { Router } from "express"
import userRoutes from "../modules/users/user.routes.ts"
import stickersRoutes from "../modules/stickers/sticker.routes.ts"
import postRoutes from "../modules/posts/post.routes.ts"

const router = Router()

//router.use("/health", healthRoutes)
router.use("/users", userRoutes)
router.use("/stickers", stickersRoutes)
router.use("/posts", postRoutes)

export default router

