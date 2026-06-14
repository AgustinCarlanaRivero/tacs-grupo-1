export type StickerType = "SHINY" | "REGULAR" | "COMMON";

export interface MockTeam {
  name: string;
  id?: string;
}

export interface MockPlayer {
  name: string;
  nationalTeam?: MockTeam | null;
  club?: MockTeam | null;
  image: string;
}

export interface MockSticker {
  number: number;
  player: MockPlayer;
  type: StickerType;
}

export interface MockUser {
  id: number | string;
  name: string;
  username?: string;
}

export interface MockCollectionItem {
  sticker: MockSticker;
  quantity: number;
}

export type AuctionState = "ACTIVE" | "COMPLETED" | "CLOSED";

export interface MockAuction {
  id: number | string;
  state: AuctionState;
  sticker: MockSticker;
  owner: MockUser;
  createdAt: Date | string;
  endsAt: Date | string;
  minimumRequirement?: number;
}

export type TradeState = "ACTIVE" | "COMPLETED" | "CLOSED";

export interface MockTrade {
  id: number | string;
  state: TradeState;
  sticker: MockSticker;
  owner: MockUser;
}

export type OfferState = "PENDING" | "ACCEPTED" | "REJECTED" | "APPROVED" | "CANCELLED";

export interface MockOffer {
  id: string;
  offerer: MockUser;
  state: OfferState;
  createdAt: Date;
  offered: MockCollectionItem[];
}

export type MockOffersByTradeId = Record<number | string, MockOffer[]>;

export interface MockSuggestion {
  id: number;
  from: MockUser;
  theirSticker: MockSticker;
  yourSticker: MockSticker;
  createdAt: string;
}

export type NotificationType =
  | "TRADE_SUGGESTION"
  | "STICKER_AVAILABLE"
  | "OFFER_RECEIVED"
  | "AUCTION_ENDING"
  | "OFFER_ACCEPTED";

export interface MockNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  link?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
