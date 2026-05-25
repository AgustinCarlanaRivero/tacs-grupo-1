import { Offer } from "../../offers/entities/offer.entity";
import { Post } from "./post.entity";
import { PostState } from "../enums/post-state.enum";
import { PostType } from "../enums/post-type.enum";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { BadRequestError } from "../../../shared/errors/http-errors";

export class Auction extends Post {
  createdAt: Date;
  endsAt: Date;
  minimumRequirement: number;

  constructor(
    owner: User,
    sticker: Sticker,
    createdAt: Date = new Date(),
    endsAt: Date,
    minimumRequirement: number = 1,
    state: PostState = PostState.ACTIVE,
    offers: Offer[] = [],
    id?: string,
  ) {
    super(owner, sticker, state, offers, id);
    this.createdAt = createdAt;
    this.endsAt = endsAt;
    this.minimumRequirement = minimumRequirement;
  }

  getType(): PostType {
    return PostType.AUCTION;
  }

  hasEnded(at: Date = new Date()): boolean {
    return at.getTime() >= this.endsAt.getTime();
  }

  canReceiveOffers(at: Date = new Date()): boolean {
    return super.canReceiveOffers(at) && !this.hasEnded(at);
  }

  duration(): number {
    return this.endsAt.getTime() - this.createdAt.getTime();
  }

  lastOffer(): Offer | null {
    const offers = this.requireHydratedOffers();

    if (offers.length === 0) {
      return null;
    }

    return offers[offers.length - 1];
  }

  addOffer(offer: Offer) {
    const last = this.lastOffer();
    const minimum = last ? last.getOfferedQuantity() : this.minimumRequirement;

    if (offer.getOfferedQuantity() < minimum) {
      throw new BadRequestError(
        last
          ? `The offer must exceed the previous offer's quantity`
          : `The offer must meet the minimum requirement of ${this.minimumRequirement} stickers`
      );
    }

    return super.addOffer(offer);
  }
}

