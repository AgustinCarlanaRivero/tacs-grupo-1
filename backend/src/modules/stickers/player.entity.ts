import { Club } from "./club.entity";
import { NationalTeam } from "./national-team.entity";

export class Player {
  name: string;
  nationalTeam: NationalTeam;
  club: Club;

  constructor(name: string, nationalTeam: NationalTeam, club: Club) {
    this.name = name;
    this.nationalTeam = nationalTeam;
    this.club = club;
  }
}
