import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../users/enums/user-role.enum";
import { Rating } from "../entities/rating.entity";
import { RatingModel } from "../schemas/rating.model";

type RatingPersistence = {
    _id: string;
    reviewerId: string;
    revieweeId: string;
    score: number;
    comment: string;
    createdAt: Date;
};

const buildUserRef = (id: string) =>
    new User("", "", "", "", UserRole.STANDARD, 0, null, id);

class RatingRepository extends BaseRepository<RatingPersistence, Rating> {
    constructor() {
        super(RatingModel);
    }

    protected toEntity(doc: HydratedDocument<RatingPersistence>): Rating {
        const reviewer = buildUserRef(doc.reviewerId);
        const reviewee = buildUserRef(doc.revieweeId);
        return new Rating(
            reviewer,
            reviewee,
            doc.score,
            doc.comment ?? "",
            doc.createdAt,
            doc._id,
        );
    }

    protected toPersistence(
        rating: Rating,
    ): Partial<RatingPersistence> & { _id?: string } {
        const id = rating.id || crypto.randomUUID();
        if (!rating.id) {
            rating.setId(id);
        }

        return {
            _id: id,
            reviewerId: rating.reviewer.id,
            revieweeId: rating.reviewee.id,
            score: rating.score,
            comment: rating.comment ?? "",
            createdAt: rating.createdAt,
        };
    }

    async save(rating: Rating): Promise<Rating> {
        return super.save(rating);
    }

    async findById(id: string): Promise<Rating | null> {
        return super.findById(id);
    }

    async findByRevieweeId(revieweeId: string): Promise<Rating[]> {
        return this.findMany({ revieweeId } as FilterQuery<RatingPersistence>);
    }

    async findByReviewerId(reviewerId: string): Promise<Rating[]> {
        return this.findMany({ reviewerId } as FilterQuery<RatingPersistence>);
    }

    async findAll(): Promise<Rating[]> {
        return this.findMany();
    }

    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<RatingPersistence>);
    }
}

export default new RatingRepository();
