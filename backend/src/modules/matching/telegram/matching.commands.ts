import type { Bot } from "grammy";
import { pagerKeyboard } from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import MatchingService from "../services/matching.service";
import { formatSuggestionsPage } from "./matching.formatter";

const PAGE_SIZE = 5;

type Mode = "reply" | "edit";

async function sendSuggestionsPage(
    ctx: AppContext,
    userId: string,
    mode: Mode,
    page: number,
) {
    const result = await MatchingService.getSuggestionsByUser(
        userId,
        page,
        PAGE_SIZE,
    );
    const text = formatSuggestionsPage(result);
    const keyboard = pagerKeyboard(result, (p) => `sug:${p}`);

    if (mode === "edit") {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Comando de sugerencias de intercambio (read-only): usuarios que tienen las
 * figuritas que te faltan. Delega en `MatchingService`; el bot solo formatea.
 */
export function registerMatchingCommands(bot: Bot<AppContext>): void {
    bot.command("sugerencias", async (ctx) => {
        const user = await requireLinkedUser(ctx);
        if (!user) return;
        await sendSuggestionsPage(ctx, user.id, "reply", 1);
    });

    bot.callbackQuery(/^sug:(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendSuggestionsPage(
            ctx,
            ctx.appUser.id,
            "edit",
            Number(ctx.match[1]),
        );
        await ctx.answerCallbackQuery();
    });
}
