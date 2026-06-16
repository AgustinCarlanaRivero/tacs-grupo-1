import { BadRequestError } from "../../../shared/errors/http-errors";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { Auction } from "../entities/auction.entity";

export default class AuctionService {
    static createAuction(
        owner: User,
        sticker: Sticker,
        endsAt: Date,
        minimumRequirement: number = 1,
        quantity: number = 1,
    ): Auction {
        if (Number.isNaN(endsAt.getTime())) {
            throw new BadRequestError("endsAt debe ser una fecha valida");
        }

        if (endsAt.getTime() <= Date.now()) {
            throw new BadRequestError("endsAt debe ser una fecha futura");
        }

        if (minimumRequirement < 1) {
            throw new BadRequestError(
                "minimumRequirement debe ser mayor o igual a 1",
            );
        }

        return new Auction(
            owner,
            sticker,
            new Date(),
            endsAt,
            minimumRequirement,
            undefined,
            undefined,
            undefined,
            quantity,
        );
    }
}
