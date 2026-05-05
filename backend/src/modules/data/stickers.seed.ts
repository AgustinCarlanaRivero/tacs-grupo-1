import { Category } from "../stickers/entities/category.entity";
import { Sticker } from "../stickers/entities/sticker.entity";
import stickerRepository from "../stickers/repositories/sticker.repository";

type SeedStickerInput = {
  number: number;
  playerName: string;
  nationalTeamName: string;
  clubName: string;
  state: "NEW" | "DAMAGED";
  type: "REGULAR" | "SHINY";
  image?: string;
  description?: string;
};

export const STICKER_SEED_DATA: SeedStickerInput[] = [
  {
    number: 10,
    playerName: "Lionel Messi",
    nationalTeamName: "Argentina",
    clubName: "Inter Miami",
    state: "NEW",
    type: "SHINY",
    image: "https://assets1.afa.com.ar/media/DANI/NOVIEMBRE/WebN-messicgol2.jpg",
  },
  {
    number: 23,
    playerName: "Emiliano Martinez",
    nationalTeamName: "Argentina",
    clubName: "Aston Villa",
    state: "NEW",
    type: "REGULAR",
    image: "https://statics.eleconomista.com.ar/2022/11/63727a837ac3c.jpg",
  },
  {
    number: 11,
    playerName: "Angel Di Maria",
    nationalTeamName: "Argentina",
    clubName: "Benfica",
    state: "NEW",
    type: "SHINY",
    image: "https://www.clarin.com/2024/08/30/v6SPsl63z_2000x1500__1.jpg",
  },
  {
    number: 9,
    playerName: "Julian Alvarez",
    nationalTeamName: "Argentina",
    clubName: "Atletico Madrid",
    state: "NEW",
    type: "REGULAR",
    image: "https://fotos.perfil.com/2024/07/14/trim/1280/720/julian-alvarez-1835378.jpg",
  },
  {
    number: 7,
    playerName: "Rodrigo De Paul",
    nationalTeamName: "Argentina",
    clubName: "Atletico Madrid",
    state: "NEW",
    type: "REGULAR",
    image: "https://media.topmercato.com/arg/2024/07/ICONSPORT_232907_0033.jpg",
  },
  {
    number: 8,
    playerName: "Enzo Fernandez",
    nationalTeamName: "Argentina",
    clubName: "Chelsea",
    state: "NEW",
    type: "REGULAR",
    image: "https://media.lmneuquen.com/p/072c3680e4a33f817d9a0d90a9273352/adjuntos/195/imagenes/007/736/0007736389/770x0/smart/enzo-fernandez-1jpg.jpg",
  },
  {
    number: 12,
    playerName: "Kylian Mbappe",
    nationalTeamName: "Francia",
    clubName: "Real Madrid",
    state: "NEW",
    type: "SHINY",
    image: "https://abcmundial.com/sites/default/files/noticias/2022/05/21/Kylian%20Mbappe%20signs%20new%20three-year%20deal%20with%20PSG.%C2%A0.jpg",
  },
];

export function seedStickers(): Sticker[] {
  const stickers = STICKER_SEED_DATA.map((item) => {
    const player = {
      name: item.playerName,
      nationalTeam: { name: item.nationalTeamName },
      club: { name: item.clubName },
      image: item.image ?? "",
    };

    return new Sticker(
      item.number,
      player as Sticker["player"],
      new Category(item.state, item.type),
      item.description ?? "",
    );
  });

  for (const sticker of stickers) {
    stickerRepository.save(sticker);
  }

  return stickers;
}
