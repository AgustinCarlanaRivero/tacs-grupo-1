import { User } from "../users/user.entity";

export class Rating {
  reviewer: User;
  reviewee: User;
  score: number;
  comment: string;
  createdAt: Date;

  constructor(reviewer: User, reviewee: User, score: number, comment: string = "", createdAt = new Date()) {
    this.reviewer = reviewer;
    this.reviewee = reviewee;
    this.score = score;
    this.comment = comment;
    this.createdAt = createdAt;
  }
}
