export const PostType = {
  DIRECT_TRADE: "DIRECT_TRADE",
  AUCTION: "AUCTION",
} as const;

export type PostType = typeof PostType[keyof typeof PostType];

export function isPostType(value: unknown): value is PostType {
  return value === PostType.DIRECT_TRADE || value === PostType.AUCTION;
}