import { Router } from "express"
import userRoutes from "../modules/users/routes/user.routes"
import stickersRoutes from "../modules/stickers/routes/sticker.routes"
import notificationRoutes from "../modules/notifications/routes/notification.routes"
import matchingRoutes from "../modules/matching/routes/matching.routes"
import authRoutes from "../modules/auth/routes/auth.routes"
import adminRoutes from "../modules/admin/routes/admin.routes"
import { verifyJwt, attachUser, attachDevUser } from "../modules/auth/middleware/auth.middleware"

const router = Router()
const disableAuth = process.env.DISABLE_AUTH === "true"
const authChain = disableAuth ? [attachDevUser] : [verifyJwt, attachUser]

router.use("/auth", ...authChain, authRoutes)
router.use("/admin", ...authChain, adminRoutes)

router.use("/users", ...authChain, userRoutes)
router.use("/stickers", stickersRoutes)
router.use("/notifications", ...authChain, notificationRoutes)
router.use("/matches", ...authChain, matchingRoutes)

export default router
