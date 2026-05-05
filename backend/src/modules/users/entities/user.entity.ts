import { Collection } from "../../collection/entities/collection.entity";
import type { Rating } from "../../ratings/entities/rating.entity";
import { UserRole } from "../enums/user-role.enum";

export class User {
  id: string;
  auth0Sub: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  reputation: number;
  collection: Collection | null;

  constructor(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    role: UserRole = UserRole.STANDARD,
    reputation = 0,
    collection: Collection | null = null,
    id: string = "",
  ) {
    this.id = id;
    this.auth0Sub = "";
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.role = role;
    this.reputation = reputation;
    this.collection = collection;
  }

  setId(id: string): void {
    this.id = id;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  hasCollection(): boolean {
    return this.collection !== null;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  canBeRatedBy(reviewer: User): boolean {
    if (this.id && reviewer.id) {
      return this.id !== reviewer.id;
    }

    return this !== reviewer;
  }

  recalculateReputationFrom(ratings: readonly Rating[]): number {
    const receivedRatings = ratings.filter((rating) => rating.isFor(this));

    if (receivedRatings.length === 0) {
      this.reputation = 0;
      return this.reputation;
    }

    const totalScore = receivedRatings.reduce((acc, rating) => acc + rating.score, 0);
    this.reputation = Number((totalScore / receivedRatings.length).toFixed(2));
    return this.reputation;
  }
}
