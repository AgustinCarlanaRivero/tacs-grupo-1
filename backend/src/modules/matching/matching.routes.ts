import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler"
import { validateQuery } from "../../shared/middleware/validation.middleware"
import { matchesQuerySchema } from "../../shared/validation/schemas"
import MatchingController from "./matching.controller"

const router = Router()
const matchingController = new MatchingController()

router.get(
    "/",
    validateQuery(matchesQuerySchema),
    asyncHandler(matchingController.getMatches),
)

export default router
