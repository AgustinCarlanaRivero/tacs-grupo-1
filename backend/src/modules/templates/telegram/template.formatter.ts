import type { Template } from "../entities/template.entity";

const STICKER_STATE_LABELS: Record<string, string> = {
    NEW: "Nueva",
    DAMAGED: "Dañada",
};

const STICKER_TYPE_LABELS: Record<string, string> = {
    REGULAR: "Normal",
    SHINY: "Brillante ✨",
};

function formatTemplateLine(template: Template): string {
    const { sticker } = template;
    const team = sticker.player.nationalTeam?.name ?? sticker.player.club?.name;
    const where = team ? ` (${team})` : "";
    const state = STICKER_STATE_LABELS[sticker.state] ?? sticker.state;
    const type = STICKER_TYPE_LABELS[sticker.type] ?? sticker.type;

    return (
        `• "${template.name}" — #${sticker.number} ${sticker.player.name}${where}` +
        ` · ${state} · ${type}`
    );
}

/**
 * Texto de una página de plantillas. El repo devuelve la lista completa, así que
 * paginamos acá cortando el slice correspondiente (igual que notificaciones).
 */
export function formatTemplatesPage(
    templates: Template[],
    page: number,
    limit: number,
): string {
    const title = "📑 Tus plantillas";

    if (templates.length === 0) {
        return `${title}\n\nTodavía no tenés plantillas guardadas.`;
    }

    const pages = Math.max(1, Math.ceil(templates.length / limit));
    const start = (page - 1) * limit;
    const lines = templates
        .slice(start, start + limit)
        .map(formatTemplateLine)
        .join("\n\n");

    return (
        `${title} (página ${page}/${pages} · ${templates.length} en total)\n\n` +
        lines
    );
}
