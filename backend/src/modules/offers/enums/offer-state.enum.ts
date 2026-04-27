export const OfferState = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED"
} as const;

export type OfferState = typeof OfferState[keyof typeof OfferState];

const OFFER_STATE_TRANSITIONS: Record<OfferState, readonly OfferState[]> = {
  [OfferState.PENDING]: [OfferState.APPROVED, OfferState.REJECTED, OfferState.CANCELLED],
  [OfferState.APPROVED]: [],
  [OfferState.REJECTED]: [],
  [OfferState.CANCELLED]: [],
};

export function canTransitionOfferState(from: OfferState, to: OfferState): boolean {
  return OFFER_STATE_TRANSITIONS[from].includes(to);
}

export function isTerminalOfferState(state: OfferState): boolean {
  return OFFER_STATE_TRANSITIONS[state].length === 0;
}