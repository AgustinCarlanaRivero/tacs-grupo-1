import type { Bot } from "grammy";
import { pagerKeyboard } from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import templateRepository from "../repositories/template.repository";
import { formatTemplatesPage } from "./template.formatter";

const PAGE_SIZE = 5;

type Mode = "reply" | "edit";

async function sendTemplatesPage(
    ctx: AppContext,
    userId: string,
    mode: Mode,
    page: number,
) {
    const templates = await templateRepository.getTemplatesByUserId(userId);
    const text = formatTemplatesPage(templates, page, PAGE_SIZE);
    const keyboard = pagerKeyboard(
        { total: templates.length, page, limit: PAGE_SIZE },
        (p) => `plt:${p}`,
    );

    if (mode === "edit") {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Comando de plantillas (read-only): las plantillas de figuritas guardadas por
 * el usuario. El repo devuelve la lista completa; paginamos en el formatter.
 */
export function registerTemplateCommands(bot: Bot<AppContext>): void {
    bot.command("plantillas", async (ctx) => {
        const user = await requireLinkedUser(ctx);
        if (!user) return;
        await sendTemplatesPage(ctx, user.id, "reply", 1);
    });

    bot.callbackQuery(/^plt:(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendTemplatesPage(
            ctx,
            ctx.appUser.id,
            "edit",
            Number(ctx.match[1]),
        );
        await ctx.answerCallbackQuery();
    });
}
