import { Router } from "express"
import userRoutes from "../modules/users/user.routes.ts"

const router = Router()

//router.use("/health", healthRoutes)
router.use("/users", userRoutes)

export default router

