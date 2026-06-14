import type { Context, NextFunction } from "grammy";
import { buildLoginUrl } from "../../../shared/utils/link-token";
import type { User } from "../../users/entities/user.entity";
import userRepository from "../../users/repositories/user.repository";

/**
 * Context flavor del bot: agrega el usuario de la app resuelto a partir del chat
 * de Telegram. Los handlers ("controllers" de esta capa) lo leen en lugar de
 * volver a consultar el repo.
 */
export type AppContext = Context & { appUser: User | null };

/**
 * Resuelve el `User` detrás del chat (`ctx.chat.id -> telegramChatId`) y lo deja
 * en `ctx.appUser`. No bloquea: los comandos deciden qué hacer si no hay usuario
 * (ej.: `/start` y `/help` responden igual; los read-only piden login).
 */
export async function attachTelegramUser(
    ctx: AppContext,
    next: NextFunction,
): Promise<void> {
    const chatId = ctx.chat?.id;
    ctx.appUser =
        chatId !== undefined
            ? await userRepository.findByTelegramChatId(String(chatId))
            : null;
    return next();
}

/**
 * Mensaje de bienvenida con el link de login del front (token de un solo uso).
 * Se usa cuando un chat no vinculado manda cualquier mensaje (plan §4, paso 1).
 */
export function loginPrompt(ctx: AppContext): string {
    const chatId = ctx.chat?.id;
    const url = chatId !== undefined ? buildLoginUrl(String(chatId)) : "";
    return (
        "¡Hola coleccionista! Para ayudarte con tu solicitud, primero iniciá sesión:\n" +
        url
    );
}

/**
 * Devuelve el usuario vinculado o, si no lo hay, responde con el link de login y
 * devuelve `null`. Los comandos read-only deben cortar cuando reciben `null`.
 */
export async function requireLinkedUser(
    ctx: AppContext,
): Promise<User | null> {
    if (ctx.appUser) return ctx.appUser;
    await ctx.reply(loginPrompt(ctx));
    return null;
}
