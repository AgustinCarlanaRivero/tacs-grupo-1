import { Club } from "./club.entity";
import { NationalTeam } from "./national-team.entity";

export class Player {
  name: string;
  nationalTeam: NationalTeam;
  club: Club;
  image: string;

  constructor(name: string, nationalTeam: NationalTeam, club: Club, image: string = "") {
    this.name = name;
    this.nationalTeam = nationalTeam;
    this.club = club;
    this.image = image;
  }
}
