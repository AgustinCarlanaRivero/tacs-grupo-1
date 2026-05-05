import { Category } from "./category.entity";
import { Player } from "./player.entity";

export class Sticker {
  number: number;
  player: Player;
  category: Category;
  description: string;

  constructor(number: number, player: Player, category: Category = new Category("NEW", "REGULAR"), description: string = "") {
    this.number = number;
    this.player = player;
    this.category = category;
    this.description = description;
  }

  // --- MÉTODOS DE VALIDACIÓN/DOMINIO ---

  public isShiny(): boolean {
    return this.category.type === "SHINY";
  }

  public isRegular(): boolean {
    return this.category.type === "REGULAR";
  }

  public isNew(): boolean {
    return this.category.state === "NEW";
  }

  public isDamaged(): boolean {
    return this.category.state === "DAMAGED";
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

  public matchesState(state: string | undefined): boolean {
    if (!state) return true;
    return this.category.state === state;
  }

  public matchesType(type: string | undefined): boolean {
    if (!type) return true;
    return this.category.type === type;
  }

  public matchesTeam(teamName: string | undefined): boolean {
    if (!teamName) return true;
    return this.playsForNationalTeam(teamName);
  }

  public matchesClub(clubName: string | undefined): boolean {
    if (!clubName) return true;
    return this.playsForClub(clubName);
  }

  public matchesFilters(filters: { state?: string; type?: string; team?: string; club?: string }): boolean {
    return (
      this.matchesState(filters.state) &&
      this.matchesType(filters.type) &&
      this.matchesTeam(filters.team) &&
      this.matchesClub(filters.club)
    );
  }

  // --- MÉTODOS DE PRESENTACIÓN ---

  public getDisplayName(): string {
    const shinyLabel = this.isShiny() ? " ✨" : "";
    const damageLabel = this.isDamaged() ? " (Dañado)" : "";
    return `#${this.number} ${this.player.name}${shinyLabel}${damageLabel}`;
  }

  
}
