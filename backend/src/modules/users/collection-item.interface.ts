import { Sticker } from "../stickers/sticker.entity";

export interface CollectionItem {
  sticker: Sticker;
  quantity: number;
}
