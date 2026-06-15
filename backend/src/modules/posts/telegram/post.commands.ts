import { InlineKeyboard, type Bot } from "grammy";
import {
    hasNextPage,
    pagerKeyboard,
} from "../../../shared/utils/telegram-pagination";
import {
    requireLinkedUser,
    type AppContext,
} from "../../auth/middleware/telegram-auth.middleware";
import OfferService from "../../offers/services/offer.service";
import StickerService from "../../stickers/services/sticker.service";
import { PostState } from "../enums/post-state.enum";
import PostService from "../services/post.service";
import {
    formatOffersPage,
    formatPostsPage,
    formatStickerDetail,
    type PostsPage,
} from "./post.formatter";

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

/** Cantidad de ofertas por publicación de la página (mapa postId -> total). */
async function offerCountsFor(result: PostsPage): Promise<Map<string, number>> {
    const entries = await Promise.all(
        result.data.map(
            async (post) =>
                [post.id, await OfferService.countOffersByPost(post.id)] as const,
        ),
    );
    return new Map(entries);
}

/**
 * Teclado de una página de publicaciones: un botón "Ver ofertas" por cada
 * publicación que tenga ofertas, más la fila de paginación.
 */
function buildPostsKeyboard(
    result: PostsPage,
    offerCounts: Map<string, number>,
    makePagerData: (page: number) => string,
): InlineKeyboard | undefined {
    const keyboard = new InlineKeyboard();
    let hasButtons = false;

    for (const post of result.data) {
        const count = offerCounts.get(post.id) ?? 0;
        if (count > 0) {
            keyboard
                .text(
                    `💬 Ofertas de #${post.sticker.number} (${count})`,
                    `ofs:${post.id}:${post.sticker.number}:1`,
                )
                .row();
            hasButtons = true;
        }
    }

    if (result.page > 1) {
        keyboard.text("◀️ Anterior", makePagerData(result.page - 1));
        hasButtons = true;
    }
    if (hasNextPage(result)) {
        keyboard.text("Siguiente ▶️", makePagerData(result.page + 1));
        hasButtons = true;
    }

    return hasButtons ? keyboard : undefined;
}

async function sendPostsPage(ctx: AppContext, mode: Mode, page: number) {
    const result = await PostService.listPosts({
        state: PostState.ACTIVE,
        page,
        limit: PAGE_SIZE,
    });
    const text = formatPostsPage(result, "📋 Publicaciones");
    await respond(ctx, mode, text, pagerKeyboard(result, (p) => `pub:${p}`));
}

async function sendMyPostsPage(
    ctx: AppContext,
    userId: string,
    mode: Mode,
    page: number,
) {
    const result = await PostService.listPostsByOwner(userId, {
        state: PostState.ACTIVE,
        page,
        limit: PAGE_SIZE,
    });
    // Solo las publicaciones propias muestran sus ofertas (conteo + botón).
    const counts = await offerCountsFor(result);
    const text = formatPostsPage(result, "🗂️ Tus publicaciones", counts);
    await respond(ctx, mode, text, buildPostsKeyboard(result, counts, (p) => `mis:${p}`));
}

async function sendFigPostsPage(
    ctx: AppContext,
    numero: string,
    mode: Mode,
    page: number,
) {
    const result = await PostService.listPosts({
        query: numero,
        state: PostState.ACTIVE,
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
 * Muestra (editando el mensaje) la página de ofertas de una publicación propia.
 * Usa `getOffersByPost`, que valida que el chat sea el dueño de la publicación.
 */
async function sendOffersPage(
    ctx: AppContext,
    ownerId: string,
    postId: string,
    stickerNumber: number,
    page: number,
) {
    const result = await OfferService.getOffersByPost(ownerId, postId, {
        page,
        limit: PAGE_SIZE,
    });
    const text = formatOffersPage(result, stickerNumber);
    const keyboard = pagerKeyboard(
        result,
        (p) => `ofs:${postId}:${stickerNumber}:${p}`,
    );
    await ctx.editMessageText(text, { reply_markup: keyboard });
}

/**
 * Comandos de consulta de publicaciones (read-only). Solo se listan las
 * publicaciones activas; cada una puede desplegar sus ofertas con un botón.
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

    // Despliega las ofertas de una publicación propia:
    // `ofs:<postId>:<número>:<página>`. Solo aparece en /mispublicaciones.
    bot.callbackQuery(/^ofs:([^:]+):(\d+):(\d+)$/, async (ctx) => {
        if (!ctx.appUser) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendOffersPage(
            ctx,
            ctx.appUser.id,
            ctx.match[1],
            Number(ctx.match[2]),
            Number(ctx.match[3]),
        );
        await ctx.answerCallbackQuery();
    });
}
