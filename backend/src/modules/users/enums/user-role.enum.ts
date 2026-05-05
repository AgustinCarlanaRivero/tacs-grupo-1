export const UserRole = {
  STANDARD: "STANDARD",
  ADMIN: "ADMIN"
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];