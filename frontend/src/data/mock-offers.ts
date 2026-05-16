import type { MockOffersByTradeId } from "./types";

// Ofertas recibidas en los intercambios del usuario actual, indexadas por trade id
export const mockOffers: MockOffersByTradeId = {
  7: [
    {
      id: "o1",
      offerer: { id: 2, name: "Carlos Mendez" },
      state: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      offered: [
        {
          sticker: {
            number: 16,
            player: { name: "Pedri", nationalTeam: { name: "España" }, club: { name: "FC Barcelona" }, image: "https://livesport-ott-images.ssl.cdn.cra.cz/r900xfq60/5e49bbcb-86b0-4cce-9065-a20b64e41865.jpeg" },
            category: "REGULAR"
          },
          quantity: 1
        },
        {
          sticker: {
            number: 22,
            player: { name: "Jude Bellingham", nationalTeam: { name: "Inglaterra" }, club: { name: "Real Madrid" }, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s" },
            category: "REGULAR"
          },
          quantity: 2
        }
      ]
    },
    {
      id: "o2",
      offerer: { id: 4, name: "Diego Silva" },
      state: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
      offered: [
        {
          sticker: {
            number: 22,
            player: { name: "Jude Bellingham", nationalTeam: { name: "Inglaterra" }, club: { name: "Real Madrid" }, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s" },
            category: "REGULAR"
          },
          quantity: 2
        }
      ]
    },
        {
      id: "o2",
      offerer: { id: 6, name: "Juan Silva" },
      state: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
      offered: [
        {
          sticker: {
            number: 12,
            player: { name: "Jude Bellingham", nationalTeam: { name: "Inglaterra" }, club: { name: "Real Madrid" }, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s" },
            category: "REGULAR"
          },
          quantity: 2
        }
      ]
    },
        {
      id: "o3",
      offerer: { id: 5, name: "Pepe Silva" },
      state: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
      offered: [
        {
          sticker: {
            number: 13,
            player: { name: "Jude Bellingham", nationalTeam: { name: "Inglaterra" }, club: { name: "Real Madrid" }, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s" },
            category: "REGULAR"
          },
          quantity: 2
        }
      ]
    }
  ],
  8: [
    {
      id: "o3",
      offerer: { id: 5, name: "Ana García" },
      state: "REJECTED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      offered: [
        {
          sticker: {
            number: 9,
            player: { name: "Erling Haaland", nationalTeam: { name: "Noruega" }, club: { name: "Man. City" }, image: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/IHKKWOFZOCLXMVSMZABJQYL23I.jpg" },
            category: "REGULAR"
          },
          quantity: 1
        }
      ]
    }
  ]
};
