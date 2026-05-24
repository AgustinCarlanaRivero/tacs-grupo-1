import { BadRequestError } from "../../../shared/errors/http-errors";
import { User } from "../../users/entities/user.entity";

export class Rating {
    id: string;
    reviewer: User;
    reviewee: User;
    score: number;
    comment: string;
    createdAt: Date;

    constructor(
        reviewer: User,
        reviewee: User,
        score: number,
        comment: string = "",
        createdAt = new Date(),
        id?: string,
    ) {
        this.id = id ?? "";
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.score = score;
        this.comment = comment;
        this.createdAt = createdAt;

        this.ensureNotSelfRating();
    }

    setId(id: string): void {
        this.id = id;
    }

    isBy(user: User): boolean {
        if (this.reviewer.id && user.id) {
            return this.reviewer.id === user.id;
        }

        return this.reviewer === user;
    }

    isFor(user: User): boolean {
        if (this.reviewee.id && user.id) {
            return this.reviewee.id === user.id;
        }

        return this.reviewee === user;
    }

    private ensureNotSelfRating(): void {
        if (
            this.reviewer.id &&
            this.reviewee.id &&
            this.reviewer.id === this.reviewee.id
        ) {
            throw new BadRequestError("A user cannot rate themselves");
        }

        if (this.reviewer === this.reviewee) {
            throw new BadRequestError("A user cannot rate themselves");
        }
    }
}
