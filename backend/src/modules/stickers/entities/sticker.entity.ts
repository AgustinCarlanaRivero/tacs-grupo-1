import type { StickerState, StickerType } from "./category.entity";
import { Player } from "./player.entity";

export class Sticker {
    number: number;
    player: Player;
    state: StickerState;
    type: StickerType;
    description: string;

    constructor(
        number: number,
        player: Player,
        state: StickerState = "NEW",
        type: StickerType = "REGULAR",
        description: string = "",
    ) {
        this.number = number;
        this.player = player;
        this.state = state;
        this.type = type;
        this.description = description;
    }

    // --- MÉTODOS DE VALIDACIÓN/DOMINIO ---

    public isShinySticker(): boolean {
        return this.type === "SHINY";
    }

    public isNewSticker(): boolean {
        return this.state === "NEW";
    }

    public isDamagedSticker(): boolean {
        return this.state === "DAMAGED";
    }

    public playsForNationalTeam(teamName: string): boolean {
        return (
            this.player.nationalTeam?.name.toLowerCase() ===
            teamName.toLowerCase()
        );
    }

    public playsForClub(clubName: string): boolean {
        return this.player.club?.name.toLowerCase() === clubName.toLowerCase();
    }

    public matchesState(state: string | undefined): boolean {
        if (!state) return true;
        return this.state === state;
    }

    public matchesType(type: string | undefined): boolean {
        if (!type) return true;
        return this.type === type;
    }

    public matchesTeam(teamName: string | undefined): boolean {
        if (!teamName) return true;
        return this.playsForNationalTeam(teamName);
    }

    public matchesClub(clubName: string | undefined): boolean {
        if (!clubName) return true;
        return this.playsForClub(clubName);
    }

    public matchesFilters(filters: {
        state?: string;
        type?: string;
        team?: string;
        club?: string;
    }): boolean {
        return (
            this.matchesState(filters.state) &&
            this.matchesType(filters.type) &&
            this.matchesTeam(filters.team) &&
            this.matchesClub(filters.club)
        );
    }

    // --- MÉTODOS DE PRESENTACIÓN ---

    public getDisplayName(): string {
        const shinyLabel = this.isShinySticker() ? " ✨" : "";
        const damageLabel = this.isDamagedSticker() ? " (Dañado)" : "";
        return `#${this.number} ${this.player.name}${shinyLabel}${damageLabel}`;
    }
}
