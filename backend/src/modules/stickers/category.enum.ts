export const Category = {
  REGULAR: "REGULAR",
  SHINY: "SHINY"
} as const;

export type Category = typeof Category[keyof typeof Category];