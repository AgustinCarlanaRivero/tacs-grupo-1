import {
    configureEmbeddedSchema,
    createMongooseSchema,
} from "../../../infra/database/schema-helpers";
import { z } from "zod";
import { Club } from "../entities/club.entity";
import { NationalTeam } from "../entities/national-team.entity";
import { Player } from "../entities/player.entity";
import { Sticker } from "../entities/sticker.entity";
import { playerResponseSchema, stickerResponseSchema } from "./sticker.schemas";

const playerPersistenceSchema = playerResponseSchema.extend({
    image: z.string().optional().default(""),
});

export const stickerPersistenceSchema = stickerResponseSchema.extend({
    description: z.string().optional().default(""),
    player: playerPersistenceSchema,
});

export const stickerModelSchema = createMongooseSchema(
    stickerPersistenceSchema,
    {
        schemaOptions: { _id: false },
    },
);

stickerModelSchema.loadClass(Sticker);
configureEmbeddedSchema(stickerModelSchema, "player", {
    clazz: Player,
});
configureEmbeddedSchema(stickerModelSchema, "player.club", {
    clazz: Club,
});
configureEmbeddedSchema(stickerModelSchema, "player.nationalTeam", {
    clazz: NationalTeam,
});
