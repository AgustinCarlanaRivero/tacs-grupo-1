import { Offer } from "./offer.entity";
import { Post } from "./post.entity";
import { PostState } from "./post-state.enum";
import { Sticker } from "../stickers/sticker.entity";
import { User } from "../users/user.entity";

export class DirectTrade extends Post {
  constructor(owner: User, sticker: Sticker, state: PostState = PostState.ACTIVE, offers: Offer[] = []) {
    super(owner, sticker, state, offers);
  }
}
