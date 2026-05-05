import { Request, Response } from "express";
import type { z } from "zod";
import {
    ForbiddenError,
    UnauthorizedError,
} from "../../../shared/errors/http-errors";
import { userIdParamSchema } from "../../../shared/validation/common";
import { UserRole } from "../enums/user-role.enum";
import {
    userQuerySchema,
    userUpdateRequestSchema,
} from "../schemas/user.schemas";
import UserService from "../services/user.service";

type UserQuery = z.infer<typeof userQuerySchema>;
type UserParams = z.infer<typeof userIdParamSchema>;
type UpdateUserBody = z.infer<typeof userUpdateRequestSchema>;
type AuthenticatedRequest = Request & { user?: { id: string; role: string } };

function requireSelfOrAdmin(req: Request, targetUserId: string) {
    const actor = (req as AuthenticatedRequest).user;
    if (!actor) {
        throw new UnauthorizedError();
    }
    if (actor.id !== targetUserId && actor.role !== UserRole.ADMIN) {
        throw new ForbiddenError();
    }
    return actor;
}

export default class UserController {
    getUsers = async (req: Request, res: Response) => {
        const { query, page, limit } = req.query as unknown as UserQuery;
        const users = await UserService.getUsers({ query, page, limit });
        return res.status(200).json(users);
    };

    getUserById = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams;
        const user = await UserService.getUserById(userId);
        return res.status(200).json(user);
    };

    updateUser = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams;
        requireSelfOrAdmin(req, userId);

        const updates = req.body as UpdateUserBody;
        const user = await UserService.updateUser(userId, updates);
        return res.status(200).json(user);
    };

    deleteUser = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams;
        requireSelfOrAdmin(req, userId);

        await UserService.deleteUser(userId);
        return res.status(204).send();
    };
}
