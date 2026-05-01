import { StickerTag, StickerTags, TYPE_TAGS, CONDITION_TAGS } from "./category.enum";
import { Player } from "./player.entity";

export class Sticker {
  number: number;
  player: Player;
  tags: StickerTag[];
  description: string;

  constructor(number: number, player: Player, tags: StickerTag[] = [StickerTags.REGULAR, StickerTags.NUEVO], description: string = "") {
    this.number = number;
    this.player = player;
    this.tags = tags;
    this.description = description;
    this.validateTags();
  }

  // --- MÉTODOS DE VALIDACIÓN/DOMINIO ---

  private validateTags(): void {
    // Verificar que no haya tags inválidos
    const validTags = Object.values(StickerTags);
    const invalidTags = this.tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
      throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
    }

    // Verificar que no haya más de un tag de tipo
    const typeTags = this.tags.filter(tag => TYPE_TAGS.includes(tag));
    if (typeTags.length > 1) {
      throw new Error(`Sticker cannot have multiple type tags: ${typeTags.join(', ')}`);
    }

    // Verificar que no haya más de un tag de condición
    const conditionTags = this.tags.filter(tag => CONDITION_TAGS.includes(tag));
    if (conditionTags.length > 1) {
      throw new Error(`Sticker cannot have multiple condition tags: ${conditionTags.join(', ')}`);
    }

    // Asegurar que tenga al menos un tag de cada grupo (por defecto)
    if (typeTags.length === 0) {
      this.tags.push(StickerTags.REGULAR);
    }
    if (conditionTags.length === 0) {
      this.tags.push(StickerTags.NUEVO);
    }
  }

  public isShiny(): boolean {
    return this.tags.includes(StickerTags.SHINY);
  }

  public isRegular(): boolean {
    return this.tags.includes(StickerTags.REGULAR);
  }

  public isNuevo(): boolean {
    return this.tags.includes(StickerTags.NUEVO);
  }

  public isUsado(): boolean {
    return this.tags.includes(StickerTags.USADO);
  }

  public isDañado(): boolean {
    return this.tags.includes(StickerTags.DAÑADO);
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

  public matchesTags(tags: StickerTag[] | undefined): boolean {
    if (!tags || tags.length === 0) return true;
    return tags.every(tag => this.tags.includes(tag));
  }

  public matchesTeam(teamName: string | undefined): boolean {
    if (!teamName) return true;
    return this.playsForNationalTeam(teamName);
  }

  public matchesClub(clubName: string | undefined): boolean {
    if (!clubName) return true;
    return this.playsForClub(clubName);
  }

  public matchesFilters(filters: { tags?: StickerTag[]; team?: string; club?: string }): boolean {
    return (
      this.matchesTags(filters.tags) &&
      this.matchesTeam(filters.team) &&
      this.matchesClub(filters.club)
    );
  }

  // --- MÉTODOS DE PRESENTACIÓN ---

  public getDisplayName(): string {
    const shinyLabel = this.isShiny() ? " ✨" : "";
    const conditionLabel = this.isDañado() ? " (Dañado)" : this.isUsado() ? " (Usado)" : "";
    return `#${this.number} ${this.player.name}${shinyLabel}${conditionLabel}`;
  }

  // Se ejecuta automáticamente al hacer res.json() o JSON.stringify()
  public toJSON() {
    return {
      id: this.number,
      title: this.getDisplayName(),
      tags: this.tags,
      description: this.description,
      player: {
        name: this.player.name,
        nationalTeam: this.player.nationalTeam?.name,
        club: this.player.club?.name,
        image: this.player.image
      }
    };
  }
}
