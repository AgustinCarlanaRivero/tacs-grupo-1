import {
    configureEmbeddedSchema,
    createMongooseSchema,
} from "../../../infra/database/schema-helpers";
import { Club } from "../entities/club.entity";
import { NationalTeam } from "../entities/national-team.entity";
import { Player } from "../entities/player.entity";
import { Sticker } from "../entities/sticker.entity";
import { stickerResponseSchema } from "./sticker.schemas";

export const stickerPersistenceSchema = stickerResponseSchema;

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
