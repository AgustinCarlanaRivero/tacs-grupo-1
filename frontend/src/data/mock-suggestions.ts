import type { MockSuggestion } from "./types";

export const mockSuggestions: MockSuggestion[] = [
  {
    id: 1,
    from: { id: 2, name: "Carlos Mendez" },
    theirSticker: {
      number: 12,
      player: {
        name: "Kylian Mbappé",
        nationalTeam: { name: "Francia" },
        club: { name: "Real Madrid" },
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR40uDMbB1wsTWFqhMl7q9eHeY_FAnbwom1mw&s",
      },
      category: "SHINY",
    },
    yourSticker: {
      number: 10,
      player: {
        name: "Lionel Messi",
        nationalTeam: { name: "Argentina" },
        club: { name: "Inter Miami" },
        image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg",
      },
      category: "COMMON",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    from: { id: 3, name: "Laura Torres" },
    theirSticker: {
      number: 20,
      player: {
        name: "Vinicius Jr.",
        nationalTeam: { name: "Brasil" },
        club: { name: "Real Madrid" },
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8g7p9iBWlKn20Lr3tUCrNkjlPFuZAPafRqA&s",
      },
      category: "SHINY",
    },
    yourSticker: {
      number: 9,
      player: {
        name: "Julián Álvarez",
        nationalTeam: { name: "Argentina" },
        club: { name: "Atlético de Madrid" },
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Argentina_national_football_team_-_2_-_2022_%28Juli%C3%A1n_%C3%81lvarez%29.jpg/250px-Argentina_national_football_team_-_2_-_2022_%28Juli%C3%A1n_%C3%81lvarez%29.jpg",
      },
      category: "COMMON",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];
