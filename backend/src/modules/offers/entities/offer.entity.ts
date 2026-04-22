import { CollectionItem } from "../../collection/collection-item.interface";
import { OfferState } from "../enums/offer-state.enum";
import { User } from "../../users/entities/user.entity";

export class Offer {
  offerer: User;
  state: OfferState;
  createdAt: Date;
  offered: CollectionItem[];

  constructor(
    offerer: User,
    offered: CollectionItem[],
    state: OfferState = OfferState.PENDING,
    createdAt = new Date(),
  ) {
    this.offerer = offerer;
    this.offered = offered;
    this.state = state;
    this.createdAt = createdAt;
  }
}
