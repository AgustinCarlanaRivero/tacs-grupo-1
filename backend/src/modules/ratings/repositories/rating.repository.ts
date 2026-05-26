import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import {
    createObjectIdString,
    toIdString,
    toObjectId,
    type PersistenceId,
} from "../../../infra/database/schema-helpers";
import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../users/enums/user-role.enum";
import { Rating } from "../entities/rating.entity";
import { RatingModel } from "../schemas/rating.model";

type RatingPersistence = {
    _id: PersistenceId;
    reviewerId: PersistenceId;
    revieweeId: PersistenceId;
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
        const reviewer = buildUserRef(toIdString(doc.reviewerId));
        const reviewee = buildUserRef(toIdString(doc.revieweeId));
        return new Rating(
            reviewer,
            reviewee,
            doc.score,
            doc.comment ?? "",
            doc.createdAt,
            toIdString(doc._id),
        );
    }

    protected toPersistence(
        rating: Rating,
    ): Partial<RatingPersistence> & { _id?: PersistenceId } {
        const id = rating.id || createObjectIdString();
        if (!rating.id) {
            rating.setId(id);
        }

        return {
            _id: toObjectId(id),
            reviewerId: toObjectId(rating.reviewer.id),
            revieweeId: toObjectId(rating.reviewee.id),
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

