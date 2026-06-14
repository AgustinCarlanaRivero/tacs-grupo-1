import { InlineKeyboard } from "grammy";

/**
 * Datos mínimos de paginación que comparten todas las listas del bot.
 */
export type Paginated = { total: number; page: number; limit: number };

/** Cantidad total de páginas (al menos 1). */
export function totalPages({ total, limit }: Paginated): number {
    return Math.max(1, Math.ceil(total / limit));
}

/** Hay una página siguiente si todavía quedan items después de la actual. */
export function hasNextPage({ total, page, limit }: Paginated): boolean {
    return page * limit < total;
}

/**
 * Arma un teclado inline con "Anterior"/"Siguiente" para una lista paginada.
 * `makeData(page)` genera el `callback_data` que vuelve al bot al tocar el botón
 * (cada comando define su propio prefijo, ej.: `pub:2`). Devuelve `undefined` si
 * no hace falta paginar (una sola página).
 */
export function pagerKeyboard(
    result: Paginated,
    makeData: (page: number) => string,
): InlineKeyboard | undefined {
    const keyboard = new InlineKeyboard();
    let hasButtons = false;

    if (result.page > 1) {
        keyboard.text("◀️ Anterior", makeData(result.page - 1));
        hasButtons = true;
    }
    if (hasNextPage(result)) {
        keyboard.text("Siguiente ▶️", makeData(result.page + 1));
        hasButtons = true;
    }

    return hasButtons ? keyboard : undefined;
}
