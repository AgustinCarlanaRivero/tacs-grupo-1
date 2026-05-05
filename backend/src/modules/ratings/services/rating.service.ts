import {
    BadRequestError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import {
    matchesAnyQuery,
    normalizeQuery,
    paginate,
} from "../../../shared/utils/query";
import { notifications } from "../../notifications/services/notification.facade";
import userRepository from "../../users/repositories/user.repository";
import { Rating } from "../entities/rating.entity";
import ratingRepository from "../repositories/rating.repository";
import { ratingResponseSchema } from "../schemas/rating.schemas";

type RatingListFilters = {
    query?: string;
    page: number;
    limit: number;
};

type RatingCreatePayload = {
    score: number;
    comment?: string;
};

function toRatingResponse(rating: Rating) {
    return ratingResponseSchema.parse({
        id: rating.id ?? "",
        reviewerId: rating.reviewer.id,
        revieweeId: rating.reviewee.id,
        score: rating.score,
        comment: rating.comment ?? "",
        createdAt: rating.createdAt.toISOString(),
    });
}

export default class RatingService {
    static async getRatingsByUser(
        revieweeId: string,
        filters: RatingListFilters,
    ) {
        const ratings = ratingRepository.findByRevieweeId(revieweeId);
        const normalizedQuery = normalizeQuery(filters.query);
        const filtered = ratings.filter((rating) =>
            matchesAnyQuery([rating.comment ?? undefined], normalizedQuery),
        );

        const data = filtered.map(toRatingResponse);
        return paginate(data, filters.page, filters.limit);
    }

    /**
     * STUB — devuelve `[]` hasta que se implemente la lógica real.
     *
     * NOTA PARA EL DUEÑO DE RATINGS:
     * Cuando persistas el rating real, mantené la llamada al facade después de
     * guardar — el destinatario es el `revieweeId`. Hay que pasarle el id del
     * rating recién creado y el score real (acá uso 0 como placeholder).
     * Ver `modules/notifications/README.md`.
     */
    static async createRating(
        revieweeId: string,
        reviewerId: string,
        body: RatingCreatePayload,
    ) {
        const reviewee = userRepository.findById(revieweeId);
        if (!reviewee) {
            throw new NotFoundError("Usuario a calificar no encontrado");
        }

        const reviewer = userRepository.findById(reviewerId);
        if (!reviewer) {
            throw new NotFoundError("Usuario revisor no encontrado");
        }

        if (body.score === undefined || body.score === null) {
            throw new BadRequestError("El score es obligatorio");
        }

        const rating = new Rating(
            reviewer,
            reviewee,
            body.score,
            body.comment ?? "",
        );
        ratingRepository.save(rating);

        const ratingsForUser = ratingRepository.findByRevieweeId(revieweeId);
        reviewee.recalculateReputationFrom(ratingsForUser);
        userRepository.save(reviewee);

        if (revieweeId && revieweeId !== reviewerId) {
            await notifications.ratingReceived(revieweeId, {
                ratingId: rating.id ?? "",
                fromUserId: reviewerId,
                score: rating.score,
            });
        }

        return toRatingResponse(rating);
    }
}
