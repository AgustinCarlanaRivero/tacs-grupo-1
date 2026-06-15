import type { z } from "zod";
import type { ratingResponseSchema } from "../../ratings/schemas/rating.schemas";
import type { User } from "../entities/user.entity";

type RatingView = z.infer<typeof ratingResponseSchema>;

/** Página de reseñas tal como la devuelve `RatingService.getRatingsByUser`. */
export type RatingsPage = {
    data: RatingView[];
    total: number;
    page: number;
    limit: number;
};

/** Estrellas llenas/vacías para un puntaje de 1 a 5. */
function stars(score: number): string {
    const filled = Math.max(0, Math.min(5, Math.round(score)));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function formatRatingLine(rating: RatingView): string {
    const date = new Date(rating.createdAt).toLocaleDateString("es-AR");
    const comment = rating.comment ? ` "${rating.comment}"` : "";
    return `${stars(rating.score)}${comment} · ${date}`;
}

/** Datos del perfil del usuario más una página de las reseñas que recibió. */
export function formatProfile(user: User, ratings: RatingsPage): string {
    const reputation =
        ratings.total === 0
            ? "sin calificaciones aún"
            : `⭐ ${user.reputation} (${ratings.total} ${
                  ratings.total === 1 ? "reseña" : "reseñas"
              })`;

    const header = [
        "👤 Tu perfil",
        "",
        `Nombre: ${user.getFullName()}`,
        `Usuario: @${user.username}`,
        `Email: ${user.email}`,
        `Reputación: ${reputation}`,
    ].join("\n");

    if (ratings.total === 0) {
        return `${header}\n\nTodavía no recibiste reseñas.`;
    }

    const pages = Math.max(1, Math.ceil(ratings.total / ratings.limit));
    const lines = ratings.data.map(formatRatingLine).join("\n");

    return (
        `${header}\n\n` +
        `⭐ Reseñas (página ${ratings.page}/${pages})\n\n` +
        lines
    );
}
