import { Router } from "express"
import { asyncHandler } from "../../shared/middleware/async-handler"
import {
    validateParams,
    validateQuery,
} from "../../shared/middleware/validation.middleware"
import {
    paginationQuerySchema,
    userIdParamSchema,
} from "../../shared/validation/schemas"
import MatchingController from "./matching.controller"

const router = Router({ mergeParams: true })
const matchingController = new MatchingController()

router.get(
    "/",
    validateParams(userIdParamSchema),
    validateQuery(paginationQuerySchema),
    asyncHandler(matchingController.getSuggestionsByUser),
)

export default router
