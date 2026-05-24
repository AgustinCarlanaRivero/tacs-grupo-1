import {
    ConflictError,
    ForbiddenError,
} from "../../../shared/errors/http-errors";
import { CollectionItem } from "../../collection/entities/collection-item.interface";
import { User } from "../../users/entities/user.entity";
import { canTransitionOfferState, OfferState } from "../enums/offer-state.enum";

export class Offer {
    id: string;
    offerer: User;
    state: OfferState;
    createdAt: Date;
    offered: CollectionItem[];

    constructor(
        offerer: User,
        offered: CollectionItem[],
        state: OfferState = OfferState.PENDING,
        createdAt = new Date(),
        id?: string,
    ) {
        this.id = id ?? "";
        this.offerer = offerer;
        this.offered = offered;
        this.state = state;
        this.createdAt = createdAt;
    }

    setId(id: string): void {
        this.id = id;
    }

    isPending(): boolean {
        return this.state === OfferState.PENDING;
    }

    isByUser(user: User): boolean {
        if (this.offerer.id && user.id) {
            return this.offerer.id === user.id;
        }

        return this.offerer === user;
    }

    approve(): void {
        this.transitionTo(OfferState.APPROVED);
    }

    reject(): void {
        this.transitionTo(OfferState.REJECTED);
    }

    cancelBy(user: User): void {
        if (!this.isByUser(user)) {
            throw new ForbiddenError(
                "Only the offer owner can cancel the offer",
            );
        }

        this.transitionTo(OfferState.CANCELLED);
    }

    transitionTo(nextState: OfferState): void {
        if (!canTransitionOfferState(this.state, nextState)) {
            throw new ConflictError(
                `Invalid offer state transition from ${this.state} to ${nextState}`,
            );
        }

        this.state = nextState;
    }

    getOfferedQuantity(): number {
        return this.offered.reduce((sum, item) => sum + item.quantity, 0);
    }
}
