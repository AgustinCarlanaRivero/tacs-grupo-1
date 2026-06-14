import { Bot } from "grammy";
import type { AppContext } from "../../modules/auth/middleware/telegram-auth.middleware";
import { TelegramChannel } from "../../modules/notifications/channels/telegram.channel";
import notificationService from "../../modules/notifications/services/notification.service";
import { registerBotCommands } from "../../routes/bot-commands";

/**
 * Bot de Telegram (grammY) como segunda capa de presentación del backend.
 * Singleton: se crea en `startTelegramBot()` y se frena en `stopTelegramBot()`.
 * Es opcional: sin `TELEGRAM_BOT_TOKEN` el backend arranca igual sin bot.
 */
let bot: Bot<AppContext> | null = null;

export function getBot(): Bot<AppContext> | null {
    return bot;
}

/**
 * Envía un mensaje suelto a un chat por fuera del flujo de comandos (p. ej. para
 * confirmar la vinculación desde el endpoint HTTP). No hace nada si el bot no
 * está corriendo; un fallo de Telegram se loguea pero no se propaga.
 */
export async function sendTelegramMessage(
    chatId: string,
    text: string,
): Promise<void> {
    if (!bot) return;
    try {
        await bot.api.sendMessage(chatId, text);
    } catch (error) {
        console.error("No se pudo enviar el mensaje de Telegram:", error);
    }
}

/**
 * Crea el bot, registra los comandos y arranca el long polling. Si no hay token
 * configurado, loguea un warning y no hace nada (dev/test/CI).
 */
export async function startTelegramBot(): Promise<void> {
    if (bot) return;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token.trim().length === 0) {
        console.warn(
            "TELEGRAM_BOT_TOKEN no configurado: el bot de Telegram no arranca.",
        );
        return;
    }

    const frontend_url = process.env.FRONTEND_URL;
    if (!frontend_url || frontend_url.trim().length === 0) {
        console.warn(
            "FRONTEND_URL no configurado: el bot de Telegram no arranca.",
        );
        return;
    }

    const instance = new Bot<AppContext>(token);
    instance.catch((err) =>
        console.error("Error no manejado en el bot de Telegram:", err),
    );

    registerBotCommands(instance);

    // Valida el token contra Telegram (BotFather) antes de pollear.
    await instance.init();
    bot = instance;

    // Suma el push por Telegram a los canales del notificationService. Con esto,
    // todos los eventos del facade salen también por Telegram (plan §6).
    notificationService.addChannel(new TelegramChannel(instance));

    // `bot.start()` resuelve recién al frenar: lo dejamos correr en segundo plano.
    void instance
        .start({
            onStart: (info) =>
                console.log(
                    `Telegram bot @${info.username} iniciado (long polling)`,
                ),
        })
        .catch((err) =>
            console.error("El long polling de Telegram falló:", err),
        );
}

/** Frena el long polling y limpia el singleton. */
export async function stopTelegramBot(): Promise<void> {
    if (!bot) return;
    await bot.stop();
    bot = null;
}
