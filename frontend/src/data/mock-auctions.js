export const mockAuctions = [
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
      category: "SHINY"
    },
    owner: { id: 8, name: "Lucas Perez" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45), // ~2 days 45 mins
    minimumRequirements: [
      {
        quantity: 1,
        sticker: {
          number: 12,
          player: {
            name: "Kylian Mbappé",
            nationalTeam: { name: "Francia" },
            club: { name: "Real Madrid" },
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR40uDMbB1wsTWFqhMl7q9eHeY_FAnbwom1mw&s"
          },
          category: "SHINY"
        }
      },
            {
        quantity: 1,
        sticker: {
          number: 16,
          player: {
            name: "Pedri",
            nationalTeam: { name: "España" },
            club: { name: "FC Barcelona" },
            image: "https://livesport-ott-images.ssl.cdn.cra.cz/r900xfq60/5e49bbcb-86b0-4cce-9065-a20b64e41865.jpeg"
          },
          category: "SHINY"
        }
      },
      {
        quantity: 1,
        sticker: {
          number: 9,
          player: {
            name: "Erling Haaland",
            nationalTeam: { name: "Noruega" },
            club: { name: "Man. City" },
            image: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/IHKKWOFZOCLXMVSMZABJQYL23I.jpg"
          },
          category: "REGULAR"
        }
      },
            {
        quantity: 2,
        sticker: {
          number: 22,
          player: {
            name: "Jude Bellingham",
            nationalTeam: { name: "Inglaterra" },
            club: { name: "Real Madrid" },
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s"
          },
          category: "REGULAR"
        }
      }
    ]
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
      category: "SHINY"
    },
    owner: { id: 9, name: "Camila Rojas" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    endsAt: new Date(Date.now() + 1000 * 60 * 15 + 1000 * 20), // ~15 mins 20 secs
    minimumRequirements: [
      {
        quantity: 2,
        sticker: {
          number: 22,
          player: {
            name: "Jude Bellingham",
            nationalTeam: { name: "Inglaterra" },
            club: { name: "Real Madrid" },
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s"
          },
          category: "REGULAR"
        }
      }
    ]
  },
  {
    id: 3,
    state: "ACTIVE",
    sticker: {
      number: 7,
      player: {
        name: "Rodrigo De Paul",
        nationalTeam: { name: "Argentina" },
        club: { name: "Atlético Madrid" },
        image: "https://media.topmercato.com/arg/2024/07/ICONSPORT_232907_0033.jpg"
      },
      category: "REGULAR"
    },
    owner: { id: 10, name: "Mario Gomez" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours
    minimumRequirements: [
      {
        quantity: 1,
        sticker: {
          number: 16,
          player: {
            name: "Pedri",
            nationalTeam: { name: "España" },
            club: { name: "FC Barcelona" },
            image: "https://livesport-ott-images.ssl.cdn.cra.cz/r900xfq60/5e49bbcb-86b0-4cce-9065-a20b64e41865.jpeg"
          },
          category: "SHINY"
        }
      },
      {
        quantity: 1,
        sticker: {
          number: 9,
          player: {
            name: "Erling Haaland",
            nationalTeam: { name: "Noruega" },
            club: { name: "Man. City" },
            image: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/IHKKWOFZOCLXMVSMZABJQYL23I.jpg"
          },
          category: "REGULAR"
        }
      },
            {
        quantity: 2,
        sticker: {
          number: 22,
          player: {
            name: "Jude Bellingham",
            nationalTeam: { name: "Inglaterra" },
            club: { name: "Real Madrid" },
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTni-jJY8d8H0x1ogj34S2n0cOus9P7_cpvBQ&s"
          },
          category: "REGULAR"
        }
      }
    ]
  }
];
