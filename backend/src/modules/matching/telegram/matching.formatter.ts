/** Una sugerencia de intercambio: un usuario y las figuritas que te puede dar. */
export type Suggestion = {
    userId: string;
    username: string;
    offerableStickers: Array<{ number: number; title: string }>;
};

export type SuggestionsPage = {
    data: Suggestion[];
    total: number;
    page: number;
    limit: number;
};

const MAX_STICKERS_PER_SUGGESTION = 5;

function formatSuggestionLine(suggestion: Suggestion): string {
    const shown = suggestion.offerableStickers
        .slice(0, MAX_STICKERS_PER_SUGGESTION)
        .map((s) => s.title)
        .join(", ");
    const rest = suggestion.offerableStickers.length - MAX_STICKERS_PER_SUGGESTION;
    const more = rest > 0 ? ` y ${rest} más` : "";

    return `👤 @${suggestion.username}\n   Te puede dar: ${shown}${more}`;
}

/** Texto de una página de sugerencias de intercambio. */
export function formatSuggestionsPage(result: SuggestionsPage): string {
    const title = "🔄 Sugerencias de intercambio";

    if (result.total === 0) {
        return (
            `${title}\n\n` +
            "No encontramos usuarios que tengan tus figuritas faltantes.\n" +
            "Cargá las figuritas que te faltan para recibir sugerencias."
        );
    }

    const pages = Math.max(1, Math.ceil(result.total / result.limit));
    const lines = result.data.map(formatSuggestionLine).join("\n\n");

    return (
        `${title} (página ${result.page}/${pages} · ${result.total} en total)\n\n` +
        lines
    );
}
