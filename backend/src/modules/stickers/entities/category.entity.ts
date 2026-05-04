export type StickerState = "NEW" | "DAMAGED";
export type StickerType = "REGULAR" | "SHINY";

export class Category {
  state: StickerState;
  type: StickerType;

  constructor(state: StickerState, type: StickerType) {
    this.state = state;
    this.type = type;
  }
}