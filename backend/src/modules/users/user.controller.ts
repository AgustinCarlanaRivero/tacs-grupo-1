import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.ts"
import UserService from "./user.service.ts"


export default class UserController {
    getUsers = async (req: Request, res: Response) => {
        const users = await UserService.getUsers()
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
