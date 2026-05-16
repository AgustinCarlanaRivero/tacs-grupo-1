import type { MockCollectionItem } from "./types";

export const mockStickers: MockCollectionItem[] = [
  {
    sticker: {
      number: 10,
      player: {
        name: "Lionel Messi",
        nationalTeam: { name: "Argentina" },
        club: { name: "Inter Miami" },
        image:
          "https://assets1.afa.com.ar/media/DANI/NOVIEMBRE/WebN-messicgol2.jpg",
      },
      category: "SHINY",
    },
    quantity: 2,
  },
  {
    sticker: {
      number: 23,
      player: {
        name: "Emiliano Martínez",
        nationalTeam: { name: "Argentina" },
        club: { name: "Aston Villa" },
        image: "https://statics.eleconomista.com.ar/2022/11/63727a837ac3c.jpg",
      },
      category: "REGULAR",
    },
    quantity: 1,
  },
  {
    sticker: {
      number: 11,
      player: {
        name: "Ángel Di María",
        nationalTeam: { name: "Argentina" },
        club: { name: "Benfica" },
        image: "https://www.clarin.com/2024/08/30/v6SPsl63z_2000x1500__1.jpg",
      },
      category: "SHINY",
    },
    quantity: 3,
  },
  {
    sticker: {
      number: 9,
      player: {
        name: "Julián Álvarez",
        nationalTeam: { name: "Argentina" },
        club: { name: "Atlético Madrid" },
        image:
          "https://fotos.perfil.com/2024/07/14/trim/1280/720/julian-alvarez-1835378.jpg",
      },
      category: "REGULAR",
    },
    quantity: 0,
  },
  {
    sticker: {
      number: 7,
      player: {
        name: "Rodrigo De Paul",
        nationalTeam: { name: "Argentina" },
        club: { name: "Atlético Madrid" },
        image:
          "https://media.topmercato.com/arg/2024/07/ICONSPORT_232907_0033.jpg",
      },
      category: "REGULAR",
    },
    quantity: 1,
  },
  {
    sticker: {
      number: 8,
      player: {
        name: "Enzo Fernández",
        nationalTeam: { name: "Argentina" },
        club: { name: "Chelsea" },
        image:
          "https://media.lmneuquen.com/p/072c3680e4a33f817d9a0d90a9273352/adjuntos/195/imagenes/007/736/0007736389/770x0/smart/enzo-fernandez-1jpg.jpg",
      },
      category: "REGULAR",
    },
    quantity: 5,
  },
  {
    sticker: {
      number: 12,
      player: {
        name: "Kylian Mbappé",
        nationalTeam: { name: "Francia" },
        club: { name: "Real Madrid" },
        image:
          "https://abcmundial.com/sites/default/files/noticias/2022/05/21/Kylian%20Mbappe%20signs%20new%20three-year%20deal%20with%20PSG.%C2%A0.jpg",
      },
      category: "SHINY",
    },
    quantity: 1,
  },
];

export const mockMissingStickers: MockCollectionItem[] = [
  {
    sticker: {
      number: 5,
      player: {
        name: "Lautaro Martínez",
        nationalTeam: { name: "Argentina" },
        club: { name: "Inter de Milán" },
        image:
          "https://cdn.futbolargentino.com/sdi/2025/01/29/inter-de-milan-vencio-3-0-a-monaco-con-tres-goles-de-lautaro-martinez-por-la-champions-league-1271126.jpg",
      },
      category: "REGULAR",
    },
    quantity: 0,
  },
  {
    sticker: {
      number: 14,
      player: {
        name: "Exequiel Palacios",
        nationalTeam: { name: "Argentina" },
        club: { name: "Bayer Leverkusen" },
        image:
          "https://www.afa.com.ar/Sitio/media/manager/1000/750/c/aHR0cHM6Ly93d3cuYWZhLmNvbS5hci91cGxvYWQvdG9ybmVvL3dpZGdldHMvYXZhdGFyX3VzdWFyaW9zL0p1Z2Fkb3Jlcy9wYWxhY2lvc19iYXllci5qcGc_",
      },
      category: "REGULAR",
    },
    quantity: 0,
  },
  {
    sticker: {
      number: 21,
      player: {
        name: "Paulo Dybala",
        nationalTeam: { name: "Argentina" },
        club: { name: "AS Roma" },
        image:
          "https://assets-es.imgfoot.com/media/cache/1200x1200/paulo-dybala-2526.jpg",
      },
      category: "SHINY",
    },
    quantity: 0,
  },
  {
    sticker: {
      number: 3,
      player: {
        name: "Cristian Romero",
        nationalTeam: { name: "Argentina" },
        club: { name: "Tottenham" },
        image:
          "https://media.tycsports.com/files/2026/04/29/945222/cuti-romero_w862.webp",
      },
      category: "REGULAR",
    },
    quantity: 0,
  },
];
