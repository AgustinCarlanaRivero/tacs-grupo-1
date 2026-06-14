import { baseApi } from "./baseApi";

export interface LinkTelegramResponse {
  linked: boolean;
}

export interface LinkTelegramRequest {
  token: string;
}

/**
 * Endpoint de vinculación de Telegram. El token de Auth0 se adjunta solo vía
 * `baseApi` (`prepareHeaders` → `tokenStore`), así que la mutation no maneja headers.
 *
 * Contrato backend: `POST /users/telegram/link`, body `{ token }`,
 * `200 { linked: true }`; `400` si el token es inválido/expirado; `401` sin auth.
 */
export const telegramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    linkTelegram: builder.mutation<LinkTelegramResponse, LinkTelegramRequest>({
      query: (body) => ({
        url: "/users/telegram/link",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLinkTelegramMutation } = telegramApi;
