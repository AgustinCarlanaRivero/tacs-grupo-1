import { CollectionItem } from "../../collection/collection-item.interface";
import { Offer } from "../../offers/entities/offer.entity";
import { Post } from "./post.entity";
import { PostState } from "../enums/post-state.enum";
import { Sticker } from "../../stickers/sticker.entity";
import { User } from "../../users/entities/user.entity";

export class Auction extends Post {
  createdAt: Date;
  endsAt: Date;
  minimumRequirements: CollectionItem[];

  constructor(
    owner: User,
    sticker: Sticker,
    createdAt: Date = new Date(),
    endsAt: Date,
    minimumRequirements: CollectionItem[] = [],
    state: PostState = PostState.ACTIVE,
    offers: Offer[] = [],
  ) {
    super(owner, sticker, state, offers);
    this.createdAt = createdAt;
    this.endsAt = endsAt;
    this.minimumRequirements = minimumRequirements;
  }

  duration(): number {
    return this.endsAt.getTime() - this.createdAt.getTime();
  }

  lastOffer(): Offer | null {
    if (this.offers.length === 0) {
      return null;
    }

    return this.offers[this.offers.length - 1];
  }
}
