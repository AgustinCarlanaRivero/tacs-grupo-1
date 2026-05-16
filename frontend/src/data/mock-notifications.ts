import type { MockNotification } from "./types";

export const mockNotifications: MockNotification[] = [
  {
    id: "0",
    userId: "user-1",
    type: "TRADE_SUGGESTION",
    message: "Carlos Mendez quiere intercambiar su Mbappé por tu Messi. ¡Mirá la sugerencia!",
    read: false,
    link: "/trades?tab=suggestions",
    payload: { suggestionId: 1 },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "1",
    userId: "user-1",
    type: "STICKER_AVAILABLE",
    message: "¡Lionel Messi (#10) está disponible para intercambio!",
    read: false,
    payload: { stickerId: 10 },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // hace 5 mins
  },
  {
    id: "2",
    userId: "user-1",
    type: "OFFER_RECEIVED",
    message: "Recibiste una nueva oferta por tu figurita de Dibu Martínez.",
    read: false,
    payload: { offerId: "off-123" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // hace 1 hora
  },
  {
    id: "3",
    userId: "user-1",
    type: "AUCTION_ENDING",
    message: "La subasta por Kylian Mbappé termina en 1 hora.",
    read: true,
    payload: { auctionId: "auc-456" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // hace 1 día
  },
  {
    id: "4",
    userId: "user-1",
    type: "OFFER_ACCEPTED",
    message: "Tu oferta por Neymar Jr. fue aceptada.",
    read: true,
    payload: { offerId: "off-789" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // hace 2 días
  },
];
