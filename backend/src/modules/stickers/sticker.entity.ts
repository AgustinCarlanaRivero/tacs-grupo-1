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

  // --- MÉTODOS DE VALIDACIÓN/DOMINIO ---

  public isShiny(): boolean {
    return this.category === Category.SHINY;
  }

  public isRegular(): boolean {
    return this.category === Category.REGULAR;
  }

  public playsForNationalTeam(teamName: string): boolean {
    return this.player.nationalTeam?.name.toLowerCase() === teamName.toLowerCase();
  }

  public playsForClub(clubName: string): boolean {
    return this.player.club?.name.toLowerCase() === clubName.toLowerCase();
  }

  public belongsToPlayer(playerName: string): boolean {
    return this.player.name.toLowerCase() === playerName.toLowerCase();
  }

  public matchesCategory(category: Category | undefined): boolean {
    if (!category) return true;
    return this.category === category;
  }

  public matchesTeam(teamName: string | undefined): boolean {
    if (!teamName) return true;
    return this.playsForNationalTeam(teamName);
  }

  public matchesClub(clubName: string | undefined): boolean {
    if (!clubName) return true;
    return this.playsForClub(clubName);
  }

  public matchesFilters(filters: { category?: Category; team?: string; club?: string }): boolean {
    return (
      this.matchesCategory(filters.category) &&
      this.matchesTeam(filters.team) &&
      this.matchesClub(filters.club)
    );
  }

  // --- MÉTODOS DE PRESENTACIÓN ---

  public getDisplayName(): string {
    const categoryLabel = this.isShiny() ? " ✨" : "";
    return `#${this.number} ${this.player.name}${categoryLabel}`;
  }

  // Se ejecuta automáticamente al hacer res.json() o JSON.stringify()
  public toJSON() {
    return {
      id: this.number,
      title: this.getDisplayName(),
      category: this.category,
      description: this.description,
      player: {
        name: this.player.name,
        nationalTeam: this.player.nationalTeam?.name,
        club: this.player.club?.name
      }
    };
  }
}
