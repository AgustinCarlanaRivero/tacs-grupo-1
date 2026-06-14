import type { Bot } from "grammy";
import {
    pagerKeyboard,
    type Paginated,
} from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import notificationService from "../services/notification.service";
import { formatNotificationsPage } from "./notification.formatter";

const PAGE_SIZE = 5;

type Mode = "reply" | "edit";

async function sendNotificationsPage(
    ctx: AppContext,
    userId: string,
    mode: Mode,
    page: number,
) {
    const items = await notificationService.getByUserId(userId, true);
    const text = formatNotificationsPage(items, page, PAGE_SIZE);
    const result: Paginated = { total: items.length, page, limit: PAGE_SIZE };
    const keyboard = pagerKeyboard(result, (p) => `notif:${p}`);

    if (mode === "edit") {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Comando de consulta de notificaciones no leídas (read-only). Delega en
 * `notificationService.getByUserId`; el bot solo formatea y pagina.
 */
export function registerNotificationCommands(bot: Bot<AppContext>): void {
    bot.command("notificaciones", async (ctx) => {
        const user = await requireLinkedUser(ctx);
        if (!user) return;
        await sendNotificationsPage(ctx, user.id, "reply", 1);
    });

    bot.callbackQuery(/^notif:(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendNotificationsPage(
            ctx,
            ctx.appUser.id,
            "edit",
            Number(ctx.match[1]),
        );
        await ctx.answerCallbackQuery();
    });
}
