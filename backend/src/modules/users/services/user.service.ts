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
import { verifyLinkToken } from "../../../shared/utils/link-token";
import { sendTelegramMessage } from "../../../infra/telegram/bot";
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
        const repo = userRepository as typeof userRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number },
            ) => Promise<{
                data: unknown[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const filter: Record<string, unknown> = {};
            if (normalizedQuery) {
                const regex = new RegExp(normalizedQuery, "i");
                filter.$or = [
                    { firstName: regex },
                    { lastName: regex },
                    { username: regex },
                    { email: regex },
                ];
            }

            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });

            return {
                data: result.data.map((u) => userResponseSchema.parse(u)),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const users = await userRepository.findAll();
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
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }
        return userResponseSchema.parse(user);
    }

    static async updateUser(userId: string, updates: UserUpdatePayload) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }

        if (updates.username) {
            const existing = await userRepository.findByUsername(
                updates.username,
            );
            if (existing && existing.id !== userId) {
                throw new ConflictError("El username ya esta en uso");
            }
        }

        if (updates.email) {
            const existing = await userRepository.findByEmail(updates.email);
            if (existing && existing.id !== userId) {
                throw new ConflictError("El email ya esta en uso");
            }
        }

        if (updates.firstName !== undefined) user.firstName = updates.firstName;
        if (updates.lastName !== undefined) user.lastName = updates.lastName;
        if (updates.username !== undefined) user.username = updates.username;
        if (updates.email !== undefined) user.email = updates.email;

        await userRepository.save(user);
        return userResponseSchema.parse(user);
    }

    static async deleteUser(userId: string) {
        const deleted = await userRepository.delete(userId);
        if (!deleted) {
            throw new NotFoundError("Usuario no encontrado");
        }
    }

    /**
     * Vincula el chat de Telegram (extraído del token firmado) a la cuenta del
     * usuario autenticado. Un chat pertenece a un solo usuario: si ya estaba
     * vinculado a otra cuenta, libera el vínculo previo antes de reasignarlo.
     */
    static async linkTelegramChat(userId: string, token: string) {
        const { chatId } = verifyLinkToken(token);

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }

        const previous = await userRepository.findByTelegramChatId(chatId);
        if (previous && previous.id !== userId) {
            await userRepository.clearTelegramChatId(previous.id);
        }

        user.telegramChatId = chatId;
        await userRepository.save(user);

        await sendTelegramMessage(
            chatId,
            `¡Iniciaste sesión exitosamente, ${user.getFullName()}! 🎉\n` +
                "Escribí /help para ver qué puedo hacer.",
        );

        return { linked: true };
    }

    /**
     * Desvincula el chat de Telegram de la cuenta del usuario (comando /logout).
     * Tras esto el chat queda "deslogueado" y puede volver a iniciar sesión.
     */
    static async unlinkTelegramChat(userId: string) {
        await userRepository.clearTelegramChatId(userId);
        return { unlinked: true };
    }
}
