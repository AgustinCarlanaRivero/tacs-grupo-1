import { Request, Response } from "express"

export default class HealthController {
    // GET /health
    healthCheck = async (_req: Request, res: Response) => {
        return res.status(200).send("ok")
    }
}
