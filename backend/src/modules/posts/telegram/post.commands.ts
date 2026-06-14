import type { Bot, InlineKeyboard } from "grammy";
import { pagerKeyboard } from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import StickerService from "../../stickers/services/sticker.service";
import PostService from "../services/post.service";
import { formatPostsPage, formatStickerDetail } from "./post.formatter";

const PAGE_SIZE = 5;

type Mode = "reply" | "edit";

async function respond(
    ctx: AppContext,
    mode: Mode,
    text: string,
    keyboard?: InlineKeyboard,
): Promise<void> {
    if (mode === "edit") {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}

async function sendPostsPage(ctx: AppContext, mode: Mode, page: number) {
    const result = await PostService.listPosts({ page, limit: PAGE_SIZE });
    const text = formatPostsPage(result, "📋 Publicaciones");
    await respond(
        ctx,
        mode,
        text,
        pagerKeyboard(result, (p) => `pub:${p}`),
    );
}

async function sendMyPostsPage(
    ctx: AppContext,
    userId: string,
    mode: Mode,
    page: number,
) {
    const result = await PostService.listPostsByOwner(userId, {
        page,
        limit: PAGE_SIZE,
    });
    const text = formatPostsPage(result, "🗂️ Tus publicaciones");
    await respond(
        ctx,
        mode,
        text,
        pagerKeyboard(result, (p) => `mis:${p}`),
    );
}

async function sendFigPostsPage(
    ctx: AppContext,
    numero: string,
    mode: Mode,
    page: number,
) {
    const result = await PostService.listPosts({
        query: numero,
        page,
        limit: PAGE_SIZE,
    });
    const text = formatPostsPage(
        result,
        `🃏 Publicaciones de la figurita #${numero}`,
    );
    await respond(
        ctx,
        mode,
        text,
        pagerKeyboard(result, (p) => `fig:${p}:${numero}`),
    );
}

/**
 * Comandos de consulta de publicaciones (read-only). Cada handler resuelve el
 * usuario vinculado y delega en `PostService` / `StickerService`; el bot solo
 * formatea. La paginación usa botones inline ("Siguiente"/"Anterior").
 */
export function registerPostCommands(bot: Bot<AppContext>): void {
    bot.command("publicaciones", async (ctx) => {
        if (!(await requireLinkedUser(ctx))) return;
        await sendPostsPage(ctx, "reply", 1);
    });

    bot.callbackQuery(/^pub:(\d+)$/, async (ctx) => {
        await sendPostsPage(ctx, "edit", Number(ctx.match[1]));
        await ctx.answerCallbackQuery();
    });

    bot.command("mispublicaciones", async (ctx) => {
        const user = await requireLinkedUser(ctx);
        if (!user) return;
        await sendMyPostsPage(ctx, user.id, "reply", 1);
    });

    bot.callbackQuery(/^mis:(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendMyPostsPage(
            ctx,
            ctx.appUser.id,
            "edit",
            Number(ctx.match[1]),
        );
        await ctx.answerCallbackQuery();
    });

    bot.command("figurita", async (ctx) => {
        if (!(await requireLinkedUser(ctx))) return;

        const numero = ctx.match.trim();
        if (!/^\d+$/.test(numero)) {
            await ctx.reply(
                "Usá: /figurita <número>. Por ejemplo: /figurita 10",
            );
            return;
        }

        const sticker = await StickerService.getStickerByNumber(numero);
        if (sticker) {
            await ctx.reply(formatStickerDetail(sticker));
        } else {
            await ctx.reply(
                `No encontré la figurita #${numero} en el catálogo.`,
            );
        }

        await sendFigPostsPage(ctx, numero, "reply", 1);
    });

    bot.callbackQuery(/^fig:(\d+):(\d+)$/, async (ctx) => {
        await sendFigPostsPage(ctx, ctx.match[2], "edit", Number(ctx.match[1]));
        await ctx.answerCallbackQuery();
    });
}
