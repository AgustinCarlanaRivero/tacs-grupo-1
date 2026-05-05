import { Rating } from "../entities/rating.entity";

class RatingRepository {
    private ratings: Map<string, Rating> = new Map();
    private revieweeIndex: Map<string, string[]> = new Map();
    private reviewerIndex: Map<string, string[]> = new Map();

    save(rating: Rating): Rating {
        const id = rating.id ?? crypto.randomUUID();
        if (!rating.id) {
            rating.setId(id);
        }
        const isNew = !this.ratings.has(id);

        this.ratings.set(id, rating);

        if (isNew) {
            const revieweeId = rating.reviewee.id;
            const reviewerId = rating.reviewer.id;

            if (revieweeId) {
                const revieweeRatings =
                    this.revieweeIndex.get(revieweeId) ?? [];
                revieweeRatings.push(id);
                this.revieweeIndex.set(revieweeId, revieweeRatings);
            }

            if (reviewerId) {
                const reviewerRatings =
                    this.reviewerIndex.get(reviewerId) ?? [];
                reviewerRatings.push(id);
                this.reviewerIndex.set(reviewerId, reviewerRatings);
            }
        }

        return rating;
    }

    findById(id: string): Rating | undefined {
        return this.ratings.get(id);
    }

    findByRevieweeId(revieweeId: string): Rating[] {
        const ids = this.revieweeIndex.get(revieweeId) ?? [];
        return ids
            .map((id) => this.ratings.get(id))
            .filter((rating): rating is Rating => rating !== undefined);
    }

    findByReviewerId(reviewerId: string): Rating[] {
        const ids = this.reviewerIndex.get(reviewerId) ?? [];
        return ids
            .map((id) => this.ratings.get(id))
            .filter((rating): rating is Rating => rating !== undefined);
    }

    findAll(): Rating[] {
        return Array.from(this.ratings.values());
    }

    clear(): void {
        this.ratings.clear();
        this.revieweeIndex.clear();
        this.reviewerIndex.clear();
    }
}

export default new RatingRepository();
