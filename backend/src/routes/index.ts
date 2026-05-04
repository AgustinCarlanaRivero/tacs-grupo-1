import { Router } from "express"
import userRoutes from "../modules/users/routes/user.routes"
import stickersRoutes from "../modules/stickers/routes/sticker.routes"
import notificationRoutes from "../modules/notifications/routes/notification.routes"
import matchingRoutes from "../modules/matching/routes/matching.routes"
import authRoutes from "../modules/auth/routes/auth.routes"
import adminRoutes from "../modules/admin/routes/admin.routes"
import { verifyJwt, attachUser } from "../modules/auth/middleware/auth.middleware"

const router = Router()

router.use("/auth", verifyJwt, attachUser, authRoutes)
router.use("/admin", verifyJwt, attachUser, adminRoutes)

router.use("/users", verifyJwt, attachUser, userRoutes)
router.use("/stickers", stickersRoutes)
router.use("/notifications", verifyJwt, attachUser, notificationRoutes)
router.use("/matches", verifyJwt, attachUser, matchingRoutes)

export default router
