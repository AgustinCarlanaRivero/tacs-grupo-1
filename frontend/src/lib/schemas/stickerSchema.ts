import { z } from "zod";

export const playerSchema = z.object({
  name: z.string(),
  nationalTeam: z.object({
    id: z.string(),
    name: z.string(),
  }),
  club: z.object({
    id: z.string(),
    name: z.string(),
  }),
  image: z.string(),
});

export const categorySchema = z.object({
  state: z.enum(["NEW", "DAMAGED"]),
  type: z.enum(["REGULAR", "SHINY"]),
});

export const stickerSchema = z.object({
  number: z.number(),
  player: playerSchema,
  category: categorySchema,
  description: z.string(),
});

export type StickerDTO = z.infer<typeof stickerSchema>;
