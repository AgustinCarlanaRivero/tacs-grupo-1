import { type z } from "zod";
import {
    ConflictError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import {
    matchesAnyQuery,
    normalizeQuery,
    paginate,
} from "../../../shared/utils/query";
import userRepository from "../repositories/user.repository";
import {
    userResponseSchema,
    userUpdateRequestSchema,
} from "../schemas/user.schemas";

type UserListFilters = {
    query?: string;
    page: number;
    limit: number;
};

type UserUpdatePayload = z.infer<typeof userUpdateRequestSchema>;

export default class UserService {
    static async getUsers(filters: UserListFilters) {
        const normalizedQuery = normalizeQuery(filters.query);
        const users = userRepository.findAll();
        const filtered = normalizedQuery
            ? users.filter((user) =>
                  matchesAnyQuery(
                      [
                          user.firstName,
                          user.lastName,
                          user.username,
                          user.email,
                      ],
                      normalizedQuery,
                  ),
              )
            : users;

        const data = filtered.map((u) => userResponseSchema.parse(u));
        return paginate(data, filters.page, filters.limit);
    }

    static async getUserById(userId: string) {
        const user = userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }
        return userResponseSchema.parse(user);
    }

    static async updateUser(userId: string, updates: UserUpdatePayload) {
        const user = userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }

        if (updates.username) {
            const existing = userRepository.findByUsername(updates.username);
            if (existing && existing.id !== userId) {
                throw new ConflictError("El username ya esta en uso");
            }
        }

        if (updates.email) {
            const existing = userRepository.findByEmail(updates.email);
            if (existing && existing.id !== userId) {
                throw new ConflictError("El email ya esta en uso");
            }
        }

        if (updates.firstName !== undefined) user.firstName = updates.firstName;
        if (updates.lastName !== undefined) user.lastName = updates.lastName;
        if (updates.username !== undefined) user.username = updates.username;
        if (updates.email !== undefined) user.email = updates.email;

        userRepository.save(user);
        return userResponseSchema.parse(user);
    }

    static async deleteUser(userId: string) {
        const deleted = userRepository.delete(userId);
        if (!deleted) {
            throw new NotFoundError("Usuario no encontrado");
        }
    }
}
