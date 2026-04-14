import { Router } from "express"
import userRoutes from "../modules/users/user.routes.ts"
import stickersRoutes from "../modules/stickers/sticker.routes.ts"
import postRoutes from "../modules/posts/post.routes.ts"
import notificationRoutes from "../modules/notifications/notification.routes.ts"
import matchingRoutes from "../modules/matching/matching.routes.ts"
import offerDirectRoutes from "../modules/offers/offer-direct.routes.ts"

const router = Router()

//router.use("/health", healthRoutes)
router.use("/users", userRoutes)
router.use("/stickers", stickersRoutes)
router.use("/posts", postRoutes)
router.use("/offers", offerDirectRoutes)
router.use("/notifications", notificationRoutes)
router.use("/matches", matchingRoutes)

export default router
