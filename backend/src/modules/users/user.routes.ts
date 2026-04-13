import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import UserController from "./user.controller.ts"
import collectionRouter from "../collection/collection.routes.ts"

const router = Router()
const userController = new UserController()

router.route("/").get(asyncHandler(userController.getUsers))

router
    .route("/:id")
    .get(asyncHandler(userController.getUserById))
    .patch(asyncHandler(userController.updateUser))
    .delete(asyncHandler(userController.deleteUser))

router.use("/:userId/collection", collectionRouter)

export default router
