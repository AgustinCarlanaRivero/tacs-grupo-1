import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import UserController from "./user.controller.ts"

const router = Router()
const userController = new UserController()

router.route("/").get(asyncHandler(userController.getUsers))

router
    .route("/:id")
    .get(asyncHandler(userController.getUserById))
    .patch(asyncHandler(userController.updateUser))
    .delete(asyncHandler(userController.deleteUser))

export default router
