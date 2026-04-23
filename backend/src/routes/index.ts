import { Router } from "express"
import userRoutes from "../modules/users/routes/user.routes"
import stickersRoutes from "../modules/stickers/sticker.routes"
import postRoutes from "../modules/posts/routes/post.routes"
import notificationRoutes from "../modules/notifications/routes/notification.routes"
import matchingRoutes from "../modules/matching/matching.routes"
import offerDirectRoutes from "../modules/offers/routes/offer-direct.routes"
import authRoutes from "../modules/auth/routes/auth.routes"
import adminRoutes from "../modules/admin/routes/admin.routes"
import { verifyJwt, attachUser } from "../modules/auth/middleware/auth.middleware"

const router = Router()

router.use("/auth", verifyJwt, attachUser, authRoutes)
router.use("/admin", verifyJwt, attachUser, adminRoutes)

router.use("/users", verifyJwt, attachUser, userRoutes)
router.use("/stickers", stickersRoutes)
router.use("/posts", verifyJwt, attachUser, postRoutes)
router.use("/offers", verifyJwt, attachUser, offerDirectRoutes)
router.use("/notifications", verifyJwt, attachUser, notificationRoutes)
router.use("/matches", verifyJwt, attachUser, matchingRoutes)

export default router
