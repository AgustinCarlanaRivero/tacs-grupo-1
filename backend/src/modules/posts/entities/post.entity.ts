import { Offer } from "../../offers/entities/offer.entity";
import { canTransitionPostState, PostState } from "../enums/post-state.enum";
import { PostType } from "../enums/post-type.enum";
import { Sticker } from "../../stickers/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../shared/errors/http-errors";

export abstract class Post {
  id?: string;
  owner: User;
  sticker: Sticker;
  state: PostState;
  offers: Offer[];

  protected constructor(
    owner: User,
    sticker: Sticker,
    state: PostState = PostState.ACTIVE,
    offers: Offer[] = [],
    id?: string,
  ) {
    this.id = id;
    this.owner = owner;
    this.sticker = sticker;
    this.state = state;
    this.offers = offers;
  }

  abstract getType(): PostType;

  setId(id: string): void {
    this.id = id;
  }

  isOwnedBy(user: User): boolean {
    if (this.owner.id && user.id) {
      return this.owner.id === user.id;
    }

    return this.owner === user;
  }

  isActive(): boolean {
    return this.state === PostState.ACTIVE;
  }

  canReceiveOffers(_at: Date = new Date()): boolean {
    return this.isActive();
  }

  addOffer(offer: Offer, at: Date = new Date()): void {
    if (!this.canReceiveOffers(at)) {
      throw new ConflictError("This post cannot receive offers in its current state");
    }

    if (this.isOwnedBy(offer.offerer)) {
      throw new ForbiddenError("Post owner cannot create offers on own post");
    }

    if (!offer.isPending()) {
      throw new ConflictError("Only pending offers can be attached to a post");
    }

    this.offers.push(offer);
  }

  getOfferById(offerId: string): Offer | undefined {
    return this.offers.find((offer) => offer.id === offerId);
  }

  approveOffer(offerId: string, actor: User): Offer {
    this.ensureOwnerActor(actor);

    const targetOffer = this.requireOfferById(offerId);
    targetOffer.approve();

    for (const offer of this.offers) {
      if (offer !== targetOffer && offer.isPending()) {
        offer.reject();
      }
    }

    this.complete();
    return targetOffer;
  }

  rejectOffer(offerId: string, actor: User): Offer {
    this.ensureOwnerActor(actor);

    const targetOffer = this.requireOfferById(offerId);
    targetOffer.reject();
    return targetOffer;
  }

  cancelOffer(offerId: string, actor: User): Offer {
    const targetOffer = this.requireOfferById(offerId);
    targetOffer.cancelBy(actor);
    return targetOffer;
  }

  changeState(nextState: PostState): void {
    if (!canTransitionPostState(this.state, nextState)) {
      throw new ConflictError(`Invalid post state transition from ${this.state} to ${nextState}`);
    }

    this.state = nextState;
  }

  complete(): void {
    this.changeState(PostState.COMPLETED);
  }

  close(): void {
    this.changeState(PostState.CLOSED);
  }

  private ensureOwnerActor(actor: User): void {
    if (!this.isOwnedBy(actor)) {
      throw new ForbiddenError("Only the post owner can perform this operation");
    }

    if (!this.isActive()) {
      throw new ConflictError("Post is not active");
    }
  }

  private requireOfferById(offerId: string): Offer {
    const offer = this.getOfferById(offerId);

    if (!offer) {
      throw new NotFoundError("Offer not found in post");
    }

    return offer;
  }
}

