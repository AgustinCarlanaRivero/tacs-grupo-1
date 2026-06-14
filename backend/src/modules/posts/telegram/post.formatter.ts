import type { z } from "zod";
import type { Sticker } from "../../stickers/entities/sticker.entity";
import { PostType } from "../enums/post-type.enum";
import type { postResponseSchema } from "../schemas/post.schemas";

type PostView = z.infer<typeof postResponseSchema>;

/** Página de publicaciones tal como la devuelve `PostService.listPosts`. */
export type PostsPage = {
    data: PostView[];
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

function formatPostLine(post: PostView): string {
    const { sticker, owner } = post;
    const team = sticker.player.nationalTeam?.name ?? sticker.player.club?.name;
    const where = team ? ` (${team})` : "";
    const type = TYPE_LABELS[post.type] ?? post.type;
    const state = STATE_LABELS[post.state] ?? post.state;

    return (
        `🃏 #${sticker.number} ${sticker.player.name}${where}\n` +
        `   ${type} · ${state} · por @${owner.username}`
    );
}

/** Texto de una página de publicaciones, con encabezado y total. */
export function formatPostsPage(result: PostsPage, title: string): string {
    if (result.total === 0) {
        return `${title}\n\nNo hay publicaciones para mostrar.`;
    }

    const pages = Math.max(1, Math.ceil(result.total / result.limit));
    const lines = result.data.map(formatPostLine).join("\n\n");

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
