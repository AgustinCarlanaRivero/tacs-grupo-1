import { z } from "zod";
import { stickerSchema } from "./stickerSchema";

export const collectionItemSchema = z.object({
  sticker: stickerSchema,
  quantity: z.number(),
});

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.enum(["STANDARD", "ADMIN"]),
  reputation: z.number(),
  collection: z.array(collectionItemSchema),
});

export type UserDTO = z.infer<typeof userSchema>;
export type CollectionItemDTO = z.infer<typeof collectionItemSchema>;
