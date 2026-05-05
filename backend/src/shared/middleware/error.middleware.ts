import type { NextFunction, Request, Response } from "express"
import { isHttpError } from "../errors/http-errors"

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (isHttpError(err)) {
        return res.status(err.statusCode).json({ message: err.message })
    }

    console.error(err)
    return res.status(500).json({ message: "Internal server error" })
}
