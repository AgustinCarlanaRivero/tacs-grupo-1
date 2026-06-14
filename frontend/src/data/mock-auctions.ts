import type { MockAuction } from "./types";

export const mockAuctions: MockAuction[] = [
  {
    id: 1,
    state: "ACTIVE",
    sticker: {
      number: 10,
      player: {
        name: "Lionel Messi",
        nationalTeam: { name: "Argentina" },
        club: { name: "Inter Miami" },
        image: "https://assets1.afa.com.ar/media/DANI/NOVIEMBRE/WebN-messicgol2.jpg"
      },
      type: "SHINY"
    },
    owner: { id: 8, name: "Lucas Perez" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45),
    minimumRequirement: 3,
  },
  {
    id: 2,
    state: "ACTIVE",
    sticker: {
      number: 11,
      player: {
        name: "Ángel Di María",
        nationalTeam: { name: "Argentina" },
        club: { name: "Benfica" },
        image: "https://www.clarin.com/2024/08/30/v6SPsl63z_2000x1500__1.jpg"
      },
      type: "SHINY"
    },
    owner: { id: 9, name: "Camila Rojas" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    endsAt: new Date(Date.now() + 1000 * 60 * 15 + 1000 * 20),
    minimumRequirement: 2,
  },
  {
    id: 4,
    state: "ACTIVE",
    sticker: {
      number: 8,
      player: {
        name: "Enzo Fernández",
        nationalTeam: { name: "Argentina" },
        club: { name: "Chelsea" },
        image: "https://media.lmneuquen.com/p/072c3680e4a33f817d9a0d90a9273352/adjuntos/195/imagenes/007/736/0007736389/770x0/smart/enzo-fernandez-1jpg.jpg"
      },
      type: "REGULAR"
    },
    owner: { id: 1, name: "Mateo Díaz" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 72),
  },
];
