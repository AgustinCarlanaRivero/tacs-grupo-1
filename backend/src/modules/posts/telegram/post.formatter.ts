import type { z } from "zod";
import type { Sticker } from "../../stickers/entities/sticker.entity";
import type { offerResponseSchema } from "../../offers/schemas/offer.schemas";
import { PostType } from "../enums/post-type.enum";
import type { postResponseSchema } from "../schemas/post.schemas";

type PostView = z.infer<typeof postResponseSchema>;
type OfferView = z.infer<typeof offerResponseSchema>;

/** Página de publicaciones tal como la devuelve `PostService.listPosts`. */
export type PostsPage = {
    data: PostView[];
    total: number;
    page: number;
    limit: number;
};

/** Página de ofertas tal como la devuelve `OfferService.listOffersByPost`. */
export type OffersPage = {
    data: OfferView[];
    total: number;
    page: number;
    limit: number;
};

const STATE_LABELS: Record<string, string> = {
    ACTIVE: "Activa",
    COMPLETED: "Completada",
    CLOSED: "Cerrada",
};

const TYPE_LABELS: Record<string, string> = {
    [PostType.DIRECT_TRADE]: "Intercambio directo",
    [PostType.AUCTION]: "Subasta",
};

const STICKER_STATE_LABELS: Record<string, string> = {
    NEW: "Nueva",
    DAMAGED: "Dañada",
};

const STICKER_TYPE_LABELS: Record<string, string> = {
    REGULAR: "Normal",
    SHINY: "Brillante ✨",
};

const OFFER_STATE_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aceptada",
    REJECTED: "Rechazada",
    CANCELLED: "Cancelada",
};

/** "sin ofertas" / "1 oferta" / "N ofertas". */
function offersLabel(count: number): string {
    if (count <= 0) return "sin ofertas";
    return count === 1 ? "1 oferta" : `${count} ofertas`;
}

function formatPostLine(post: PostView, offerCount?: number): string {
    const { sticker, owner } = post;
    const team = sticker.player.nationalTeam?.name ?? sticker.player.club?.name;
    const where = team ? ` (${team})` : "";
    const type = TYPE_LABELS[post.type] ?? post.type;
    const state = STATE_LABELS[post.state] ?? post.state;
    const offers =
        offerCount === undefined ? "" : ` · 💬 ${offersLabel(offerCount)}`;

    return (
        `🃏 #${sticker.number} ${sticker.player.name}${where}\n` +
        `   ${type} · ${state} · por @${owner.username}${offers}`
    );
}

/**
 * Texto de una página de publicaciones, con encabezado y total. Si se pasa
 * `offerCounts` (mapa postId -> cantidad), agrega la cantidad de ofertas a cada
 * línea.
 */
export function formatPostsPage(
    result: PostsPage,
    title: string,
    offerCounts?: Map<string, number>
): string {
    if (result.total === 0) {
        return `${title}\n\nNo hay publicaciones para mostrar.`;
    }

    const pages = Math.max(1, Math.ceil(result.total / result.limit));
    const lines = result.data
        .map((post) => formatPostLine(post, offerCounts?.get(post.id)))
        .join("\n\n");

    return (
        `${title} (página ${result.page}/${pages} · ${result.total} en total)\n\n` +
        lines
    );
}

/** Una oferta en una línea: oferente, qué ofrece y estado. */
function formatOfferLine(offer: OfferView): string {
    const stickers =
        offer.offered
            .map((item) => {
                const qty = item.quantity > 1 ? ` (x${item.quantity})` : "";
                return `#${item.sticker.number} ${item.sticker.player.name}${qty}`;
            })
            .join(", ") || "—";
    const state = OFFER_STATE_LABELS[offer.state] ?? offer.state;

    return `• @${offer.offerer.username} ofrece: ${stickers} — ${state}`;
}

/** Texto de una página de ofertas de una publicación puntual. */
export function formatOffersPage(
    result: OffersPage,
    stickerNumber: number
): string {
    const title = `💬 Ofertas de la publicación de la figurita #${stickerNumber}`;

    if (result.total === 0) {
        return `${title}\n\nTodavía no tiene ofertas.`;
    }

    const pages = Math.max(1, Math.ceil(result.total / result.limit));
    const lines = result.data.map(formatOfferLine).join("\n\n");

    return (
        `${title} (página ${result.page}/${pages} · ${result.total} en total)\n\n` +
        lines
    );
}

/** Detalle de una figurita puntual. */
export function formatStickerDetail(sticker: Sticker): string {
    const lines = [
        `🃏 ${sticker.getDisplayName()}`,
        `Jugador: ${sticker.player.name}`,
    ];

    if (sticker.player.nationalTeam?.name) {
        lines.push(`Selección: ${sticker.player.nationalTeam.name}`);
    }
    if (sticker.player.club?.name) {
        lines.push(`Club: ${sticker.player.club.name}`);
    }

    const state = STICKER_STATE_LABELS[sticker.state] ?? sticker.state;
    const type = STICKER_TYPE_LABELS[sticker.type] ?? sticker.type;
    lines.push(`Estado: ${state} · Tipo: ${type}`);

    if (sticker.description) {
        lines.push(`Descripción: ${sticker.description}`);
    }

    return lines.join("\n");
}
