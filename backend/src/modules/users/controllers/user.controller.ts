import { Request, Response } from "express"
import UserService from "../services/user.service"
import type { z } from "zod"
import { userQuerySchema } from "../schemas/user.schemas"

type UserQuery = z.infer<typeof userQuerySchema>

export default class UserController {
    getUsers = async (req: Request, res: Response) => {
        const { query, page, limit } = req.query as unknown as UserQuery
        const users = await UserService.getUsers({ query, page, limit })
        return res.status(200).json(users)
    }

    getUserById = async (req: Request, res: Response) => {
        const user = await UserService.getUserById()
        return res.status(200).json(user)
    }

    updateUser = async (req: Request, res: Response) => {
        const user = await UserService.updateUser()
        return res.status(200).json(user)
    }

    deleteUser = async (req: Request, res: Response) => {
        await UserService.deleteUser()
        return res.status(204).send()
    }
}
