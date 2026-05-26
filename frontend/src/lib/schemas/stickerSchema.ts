import { z } from "zod";

export const playerSchema = z.object({
  name: z.string(),
  nationalTeam: z.object({
    name: z.string(),
  }).nullable().optional(),
  club: z.object({
    name: z.string(),
  }).nullable().optional(),
  image: z.string(),
});

export const stickerSchema = z.object({
  number: z.number(),
  state: z.enum(["NEW", "DAMAGED"]),
  type: z.enum(["REGULAR", "SHINY"]),
  player: playerSchema,
  description: z.string(),
});

export type StickerDTO = z.infer<typeof stickerSchema>;
