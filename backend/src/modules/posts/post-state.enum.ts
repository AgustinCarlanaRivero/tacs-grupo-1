export const PostState = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED"
} as const;

export type PostState = typeof PostState[keyof typeof PostState];