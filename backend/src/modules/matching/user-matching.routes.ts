import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler.ts"
import MatchingController from "./matching.controller.ts"

const router = Router({ mergeParams: true })
const matchingController = new MatchingController()

router.get("/", asyncHandler(matchingController.getSuggestionsByUser))

export default router
