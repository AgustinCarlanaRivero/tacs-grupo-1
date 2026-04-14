import { CollectionItem } from "./collection-item.interface";
import { Sticker } from "../stickers/sticker.entity";

export class Collection {
  items: CollectionItem[];
  missingStickers: Sticker[];

  constructor(items: CollectionItem[] = [], missingStickers: Sticker[] = []) {
    this.items = items;
    this.missingStickers = missingStickers;
  }
}
