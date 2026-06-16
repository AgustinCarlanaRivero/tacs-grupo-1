import { Offer } from "../../offers/entities/offer.entity";
import { Post } from "./post.entity";
import { PostState } from "../enums/post-state.enum";
import { PostType } from "../enums/post-type.enum";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";

export class DirectTrade extends Post {
  constructor(
    owner: User,
    sticker: Sticker,
    state: PostState = PostState.ACTIVE,
    offers: Offer[] = [],
    id?: string,
    quantity: number = 1,
  ) {
    super(owner, sticker, state, offers, id, quantity);
  }

  getType(): PostType {
    return PostType.DIRECT_TRADE;
  }
}

