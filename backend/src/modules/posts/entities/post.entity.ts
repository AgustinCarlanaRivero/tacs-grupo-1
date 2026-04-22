import { Offer } from "../../offers/entities/offer.entity";
import { PostState } from "../enums/post-state.enum";
import { Sticker } from "../../stickers/sticker.entity";
import { User } from "../../users/entities/user.entity";

export abstract class Post {
  owner: User;
  sticker: Sticker;
  state: PostState;
  offers: Offer[];

  protected constructor(owner: User, sticker: Sticker, state: PostState = PostState.ACTIVE, offers: Offer[] = []) {
    this.owner = owner;
    this.sticker = sticker;
    this.state = state;
    this.offers = offers;
  }
}
