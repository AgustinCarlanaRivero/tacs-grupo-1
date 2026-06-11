import { z } from "zod";
import { nonEmptyString } from "../../../shared/validation/common";
import { stickerResponseSchema } from "../../stickers/schemas/sticker.schemas";

/**
 * Template response schema
 * GET /templates
 * GET /templates/:templateId
 */
export const templateResponseSchema = z
  .object({
    _id: z.string().optional(),
    name: nonEmptyString,
    sticker: stickerResponseSchema,
    userId: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .meta({ id: "Template" });

/**
 * POST /templates
 * Create template request schema
 * El usuario proporciona el nombre y los datos del sticker a guardar como template
 */
export const createTemplateRequestSchema = z
  .object({
    name: nonEmptyString,
    sticker: z.object({
      number: z.number().positive(),
      state: z.enum(["NEW", "DAMAGED"]).default("NEW"),
      type: z.enum(["REGULAR", "SHINY"]).default("REGULAR"),
      description: z.string().optional().default(""),
      player: z.object({
        name: nonEmptyString,
        nationalTeam: z.object({ name: nonEmptyString }).nullable().optional(),
        club: z.object({ name: nonEmptyString }).nullable().optional(),
        image: z.string().nullable(),
      }),
    }),
  })
  .meta({ id: "CreateTemplateRequest" });

/**
 * PATCH /templates/:templateId
 * Update template request schema
 */
export const updateTemplateRequestSchema = z
  .object({
    name: nonEmptyString.optional(),
    sticker: z
      .object({
        number: z.number().positive(),
        state: z.enum(["NEW", "DAMAGED"]).default("NEW"),
        type: z.enum(["REGULAR", "SHINY"]).default("REGULAR"),
        description: z.string().optional().default(""),
        player: z.object({
          name: nonEmptyString,
          nationalTeam: z
            .object({ name: nonEmptyString })
            .nullable()
            .optional(),
          club: z.object({ name: nonEmptyString }).nullable().optional(),
          image: z.string().nullable(),
        }),
      })
      .optional(),
  })
  .meta({ id: "UpdateTemplateRequest" });
