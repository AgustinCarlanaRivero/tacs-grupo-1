import { Category } from "./category.enum";
import { Player } from "./player.entity";

export class Sticker {
  number: number;
  player: Player;
  category: Category;
  description: string;

  constructor(number: number, player: Player, category: Category = Category.REGULAR, description: string = "") {
    this.number = number;
    this.player = player;
    this.category = category;
    this.description = description;
  }
}
