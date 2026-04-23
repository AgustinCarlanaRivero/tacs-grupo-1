import { Offer } from "../../offers/entities/offer.entity";
import { Post } from "./post.entity";
import { PostState } from "../enums/post-state.enum";
import { Sticker } from "../../stickers/sticker.entity";
import { User } from "../../users/entities/user.entity";

export class DirectTrade extends Post {
  constructor(owner: User, sticker: Sticker, state: PostState = PostState.ACTIVE, offers: Offer[] = []) {
    super(owner, sticker, state, offers);
  }
}
