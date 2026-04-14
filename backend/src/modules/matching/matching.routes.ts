import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import MatchingController from "./matching.controller.ts"

const router = Router()
const matchingController = new MatchingController()

router.get("/", asyncHandler(matchingController.getMatches))

export default router
