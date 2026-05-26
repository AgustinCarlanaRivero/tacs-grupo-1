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
        createdAt: rating.createdAt,
    });
}

export default class RatingService {
    static async getRatingsByUser(
        revieweeId: string,
        filters: RatingListFilters,
    ) {
        const normalizedQuery = normalizeQuery(filters.query);
        const repo = ratingRepository as typeof ratingRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number },
            ) => Promise<{
                data: Rating[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const baseFilter: Record<string, unknown> = { revieweeId };
            const queryFilter = normalizedQuery
                ? { comment: new RegExp(normalizedQuery, "i") }
                : null;
            const filter = queryFilter
                ? { $and: [baseFilter, queryFilter] }
                : baseFilter;

            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });

            return {
                data: result.data.map(toRatingResponse),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const ratings = await ratingRepository.findByRevieweeId(revieweeId);
        const filtered = ratings.filter((rating) =>
            matchesAnyQuery([rating.comment ?? undefined], normalizedQuery),
        );

        const data = filtered.map(toRatingResponse);
        return paginate(data, filters.page, filters.limit);
    }

    static async createRating(
        revieweeId: string,
        reviewerId: string,
        body: RatingCreatePayload,
    ) {
        const reviewee = await userRepository.findById(revieweeId);
        if (!reviewee) {
            throw new NotFoundError("Usuario a calificar no encontrado");
        }

        const reviewer = await userRepository.findById(reviewerId);
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
        await ratingRepository.save(rating);

        const ratingsForUser =
            await ratingRepository.findByRevieweeId(revieweeId);
        reviewee.recalculateReputationFrom(ratingsForUser);
        await userRepository.save(reviewee);

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

