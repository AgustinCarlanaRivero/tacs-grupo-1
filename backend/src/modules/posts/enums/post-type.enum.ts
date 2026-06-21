export const PostType = {
  DIRECT_TRADE: "DIRECT_TRADE",
  AUCTION: "AUCTION",
} as const;

export type PostType = typeof PostType[keyof typeof PostType];