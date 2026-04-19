import { Router } from "express"
import userRoutes from "../modules/users/user.routes.ts"
import stickersRoutes from "../modules/stickers/sticker.routes.ts"
import postRoutes from "../modules/posts/post.routes.ts"
import notificationRoutes from "../modules/notifications/routes/notification.routes.ts"
import matchingRoutes from "../modules/matching/matching.routes.ts"
import offerDirectRoutes from "../modules/offers/offer-direct.routes.ts"
import authRoutes from "../modules/auth/routes/auth.routes.ts"
import adminRoutes from "../modules/admin/routes/admin.routes.ts"
import { verifyJwt, attachUser } from "../modules/auth/middleware/auth.middleware.ts"

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
