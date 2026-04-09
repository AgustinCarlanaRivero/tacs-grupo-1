import HealthController from "./healthController.ts"
import {Router} from 'express'

const router = Router()
const controller = HealthController.instance()

router.route("/")
    .get((req, res) => controller.healthCheck(req, res))

export default router
