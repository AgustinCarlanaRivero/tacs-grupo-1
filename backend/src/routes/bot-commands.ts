import type { Bot } from "grammy";
import {
    attachTelegramUser,
    loginPrompt,
    type AppContext,
} from "../modules/auth/middleware/telegram-auth.middleware";
import { registerNotificationCommands } from "../modules/notifications/telegram/notification.commands";
import { registerPostCommands } from "../modules/posts/telegram/post.commands";

/**
 * Raíz de composición de los comandos del bot (equivalente a `routes/index.ts`
 * para las rutas HTTP). Conoce a todos los módulos y los conecta; cada módulo
 * expone su propio `registerXxxCommands(bot)` que se invoca acá.
 *
 * `/start` y `/help` son transversales y viven en este wiring. Los comandos de
 * consulta (posts, notificaciones) se sumarán en fases posteriores.
 */
export function registerBotCommands(bot: Bot<AppContext>): void {
    // Resuelve el usuario de la app a partir del chat en cada update.
    bot.use(attachTelegramUser);

    bot.command("start", async (ctx) => {
        const status = ctx.appUser
            ? `Ya estás vinculado como ${ctx.appUser.getFullName()}.`
            : `Todavía no vinculaste tu cuenta.\n${loginPrompt(ctx)}`;

        await ctx.reply(
            "¡Bienvenido al bot de Figuritas! 🃏\n\n" +
                `${status}\n\n` +
                "Escribí /help para ver qué puedo hacer.",
        );
    });

    bot.command("help", async (ctx) => {
        const lines = [
            "Comandos disponibles:",
            "/start — saludo y estado de vinculación",
            "/help — esta ayuda",
            "/publicaciones — ver las publicaciones del sistema",
            "/mispublicaciones — ver tus publicaciones",
            "/figurita <número> — detalle de una figurita y sus publicaciones",
            "/notificaciones — tus notificaciones sin leer",
        ];

        if (!ctx.appUser) {
            lines.push("", "Para consultar tus datos primero iniciá sesión:", loginPrompt(ctx));
        }

        await ctx.reply(lines.join("\n"));
    });

    // Comandos de consulta (read-only) de cada módulo. Se registran antes del
    // catch-all para que `bot.on("message")` solo atrape lo no reconocido.
    registerPostCommands(bot);
    registerNotificationCommands(bot);

    // Cualquier otro mensaje de un chat no vinculado recibe el link de login
    // (plan §4, paso 1 y paso 4).
    bot.on("message", async (ctx) => {
        if (!ctx.appUser) {
            await ctx.reply(loginPrompt(ctx));
            return;
        }
        await ctx.reply(
            "No reconozco ese mensaje. Escribí /help para ver los comandos.",
        );
    });
}
