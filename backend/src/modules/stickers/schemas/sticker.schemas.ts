import { z } from "zod";
import {
    nonEmptyString,
    positiveInt,
    queryString,
} from "../../../shared/validation/common";

export const stickerStateEnum = z.enum(["NEW", "DAMAGED"]);
export const stickerTypeEnum = z.enum(["REGULAR", "SHINY"]);

/** GET /stickers?state=&type=&team=&club= */
export const stickerFilterQuerySchema = z.object({
    state: stickerStateEnum.optional(),
    type: stickerTypeEnum.optional(),
    team: nonEmptyString.optional(),
    club: nonEmptyString.optional(),
    query: queryString,
});

export const nationalTeamResponseSchema = z
    .object({ name: z.string() })
    .meta({ id: "NationalTeam" });
export const clubResponseSchema = z
    .object({ name: z.string() })
    .meta({ id: "Club" });

export const playerResponseSchema = z
    .object({
        name: z.string(),
        nationalTeam: nationalTeamResponseSchema.nullable().optional(),
        club: clubResponseSchema.nullable().optional(),
        image: z.string(),
    })
    .meta({ id: "Player" });

export const stickerResponseSchema = z
    .object({
        id: positiveInt,
        title: z.string(),
        state: stickerStateEnum,
        type: stickerTypeEnum,
        description: z.string(),
        player: playerResponseSchema,
    })
    .meta({ id: "Sticker" });
