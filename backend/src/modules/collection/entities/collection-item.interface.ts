import { Sticker } from "../../stickers/entities/sticker.entity";

export interface CollectionItem {
  sticker: Sticker;
  quantity: number;
}
