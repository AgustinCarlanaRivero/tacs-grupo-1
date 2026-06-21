export const PostState = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CLOSED: "CLOSED"
} as const;

export type PostState = typeof PostState[keyof typeof PostState];

const POST_STATE_TRANSITIONS: Record<PostState, readonly PostState[]> = {
  [PostState.ACTIVE]: [PostState.COMPLETED, PostState.CLOSED],
  [PostState.COMPLETED]: [],
  [PostState.CLOSED]: [],
};

export function canTransitionPostState(from: PostState, to: PostState): boolean {
  return POST_STATE_TRANSITIONS[from].includes(to);
}