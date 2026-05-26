import { z } from "zod";
import { stickerSchema } from "./stickerSchema";
import { collectionItemSchema, userSchema } from "./userSchema";

export const postTypeSchema = z.enum(["DIRECT_TRADE", "AUCTION"]);
export const postStateSchema = z.enum(["ACTIVE", "COMPLETED", "CLOSED"]);

const postCreateStickerIdSchema = z.number().int().positive();

export const offerStateSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const postOwnerSchema = z.object({
  id: z.string().min(1),
  username: z.string(),
});

export const offerSchema = z.object({
  id: z.string(),
  offerer: userSchema,
  state: offerStateSchema,
  createdAt: z.iso.date(),
  offered: z.array(collectionItemSchema),
});

export const basePostSchema = z.object({
  id: z.string().min(1),
  state: postStateSchema,
  sticker: stickerSchema,
  owner: postOwnerSchema,
  offers: z.array(offerSchema),
});

export const directTradePostSchema = basePostSchema.extend({
  type: z.literal("DIRECT_TRADE"),
});

export const auctionPostSchema = basePostSchema.extend({
  type: z.literal("AUCTION"),
  createdAt: z.iso.date(),
  endsAt: z.iso.date(),
  minimumRequirement: z.number().int().positive(),
});

export const postSchema = z.discriminatedUnion("type", [
  directTradePostSchema,
  auctionPostSchema,
]);

export const directTradePostCreateRequestSchema = z
  .object({
    type: z.literal("DIRECT_TRADE"),
    stickerId: postCreateStickerIdSchema,
  })
  .strict();

export const auctionPostCreateRequestSchema = z
  .object({
    type: z.literal("AUCTION"),
    stickerId: postCreateStickerIdSchema,
    endsAt: z.iso.datetime(),
    minimumRequirement: z.number().int().positive(),
  })
  .strict();

export const postCreateRequestSchema = z.discriminatedUnion("type", [
  directTradePostCreateRequestSchema,
  auctionPostCreateRequestSchema,
]);

export type PostTypeDTO = z.infer<typeof postTypeSchema>;
export type PostStateDTO = z.infer<typeof postStateSchema>;
export type PostOwnerDTO = z.infer<typeof postOwnerSchema>;
export type DirectTradePostDTO = z.infer<typeof directTradePostSchema>;
export type AuctionPostDTO = z.infer<typeof auctionPostSchema>;
export type PostDTO = z.infer<typeof postSchema>;
export type PostCreateRequest = z.infer<typeof postCreateRequestSchema>;
