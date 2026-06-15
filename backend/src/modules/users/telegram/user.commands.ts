import type { Bot } from "grammy";
import { pagerKeyboard } from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import RatingService from "../../ratings/services/rating.service";
import type { User } from "../entities/user.entity";
import { formatProfile } from "./user.formatter";

const PAGE_SIZE = 5;

type Mode = "reply" | "edit";

async function sendProfilePage(
    ctx: AppContext,
    user: User,
    mode: Mode,
    page: number,
) {
    const ratings = await RatingService.getRatingsByUser(user.id, {
        page,
        limit: PAGE_SIZE,
    });
    const text = formatProfile(user, ratings);
    const keyboard = pagerKeyboard(ratings, (p) => `rev:${p}`);

    if (mode === "edit") {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}

/**
 * Comando de perfil (read-only): muestra los datos del usuario vinculado y las
 * reseñas que recibió, paginadas. El perfil sale de `ctx.appUser`; las reseñas
 * de `RatingService`.
 */
export function registerProfileCommands(bot: Bot<AppContext>): void {
    bot.command("perfil", async (ctx) => {
        const user = await requireLinkedUser(ctx);
        if (!user) return;
        await sendProfilePage(ctx, user, "reply", 1);
    });

    bot.callbackQuery(/^rev:(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendProfilePage(ctx, ctx.appUser, "edit", Number(ctx.match[1]));
        await ctx.answerCallbackQuery();
    });
}
