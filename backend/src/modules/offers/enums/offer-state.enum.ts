export const OfferState = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
} as const;

export type OfferState = typeof OfferState[keyof typeof OfferState];