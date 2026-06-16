import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { DirectTrade } from "../entities/direct-trade.entity";

export default class TradeService {
    static createTrade(owner: User, sticker: Sticker, quantity: number = 1): DirectTrade {
        return new DirectTrade(owner, sticker, undefined, undefined, undefined, quantity);
    }
}
