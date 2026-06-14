# Plan de implementación — Página `/telegram` (frontend)

> Estado: propuesta. Pendiente de aprobación antes de implementar.
> Contraparte del backend: ver `backend/docs/telegram-bot-plan.md` §4 (vinculación)
> y §12 (la página `/telegram` es trabajo del frontend).

## 1. Objetivo y alcance

Implementar la página **`/telegram`** que cierra el flujo de vinculación entre un
chat de Telegram y la cuenta del usuario. Es la "landing" a la que el bot manda al
usuario con un token de un solo uso:

```
https://<front>/telegram?token=<token>
```

La página:

1. Lee el `token` del query string.
2. Asegura que el usuario esté autenticado (login de Auth0 si hace falta).
3. Llama al backend `POST /users/telegram/link` con `Authorization: Bearer <auth0Token>`
   y body `{ token }`.
4. Muestra el resultado (éxito / error) y un botón **"Volver a Telegram"**.

Fuera de alcance: no toca el resto de la app ni el bot; es una pantalla nueva y aislada.

## 2. Flujo detallado

```
Bot ──► /telegram?token=XXX
            │
            ├─ guarda token en sessionStorage
            │
            ├─ ¿autenticado?
            │     ├─ No  ─► loginWithRedirect({ appState: { returnTo: "/telegram" } })
            │     │           └─ Auth0 ─► vuelve al origin ─► onRedirectCallback ─► router.push("/telegram")
            │     └─ Sí  ─► sigue
            │
            ├─ POST /users/telegram/link { token }   (token desde sessionStorage)
            │     ├─ 200 ─► "Sesión iniciada con éxito. Podés cerrar esta ventana."  + [Volver a Telegram]
            │     ├─ 400 ─► "El link expiró o es inválido. Volvé a Telegram y reintentá."
            │     └─ otro ─► error genérico + reintentar
            │
            └─ limpia el token de sessionStorage al terminar
```

## 3. El problema clave: el redirect de Auth0 pierde la URL

`Auth0ProviderWrapper` hoy usa `redirect_uri = window.location.origin` y **no** define
`onRedirectCallback`. Entonces, tras el login, Auth0 vuelve a `/` y se pierde tanto la
ruta `/telegram` como el `?token=`.

**Solución recomendada (estándar Auth0 SPA, mínima):**

- **Persistir el token** en `sessionStorage` apenas carga `/telegram` (antes de cualquier
  redirect).
- **Usar `appState.returnTo`** al disparar el login y **agregar `onRedirectCallback`** al
  `Auth0ProviderWrapper` para volver a la ruta guardada:

  ```tsx
  // src/components/layout/Auth0ProviderWrapper.tsx  (cambio)
  "use client";
  import { useRouter } from "next/navigation";
  import { Auth0Provider, type AppState } from "@auth0/auth0-react";

  const router = useRouter();
  // ...
  <Auth0Provider
    /* ...props existentes... */
    onRedirectCallback={(appState?: AppState) =>
      router.replace(appState?.returnTo ?? "/")
    }
  >
  ```

  Como el `redirect_uri` sigue siendo el `origin` (ya está en *Allowed Callback URLs* de
  Auth0), **no hace falta tocar la config de Auth0**. El `Auth0Provider` vive en el root
  layout, así que procesa el callback en cualquier ruta.

Alternativas descartadas:
- Cambiar `redirect_uri` a `${origin}/telegram` → obliga a sumar esa URL a *Allowed
  Callback URLs* en el dashboard de Auth0. Más fricción, sin beneficio.
- Pasar el token sólo por `returnTo` (sin sessionStorage) → funciona, pero sessionStorage
  es más robusto si el query se pierde en algún hop.

> `onRedirectCallback` es transversal (lo usa toda la app, no sólo `/telegram`). Mejora el
> comportamiento general post-login (vuelve a donde estabas) y es de bajo riesgo.

## 4. Estructura de archivos

```
src/app/telegram/
  page.tsx                 # NUEVO — la pantalla (client component)

src/store/api/
  telegramApi.ts           # NUEVO — mutation linkTelegram (RTK Query, inyectada en baseApi)

src/components/layout/
  Auth0ProviderWrapper.tsx # MODIF — agregar onRedirectCallback (returnTo)
```

## 5. Capa de API (RTK Query)

El token de Auth0 ya se adjunta solo vía `baseApi` (`prepareHeaders` → `tokenStore`),
así que la mutation no maneja headers.

```ts
// src/store/api/telegramApi.ts
import { baseApi } from "./baseApi";

export const telegramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    linkTelegram: builder.mutation<{ linked: boolean }, { token: string }>({
      query: (body) => ({
        url: "/users/telegram/link",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLinkTelegramMutation } = telegramApi;
```

Contrato backend (ya implementado): `POST /users/telegram/link`, body `{ token }`,
respuesta `200 { linked: true }`; `400` si el token es inválido/expirado; `401` sin auth.

## 6. La página `/telegram` (esqueleto)

`page.tsx` es un **client component** (`"use client"`) — usa hooks de Auth0/RTK y
`useSearchParams`. Como `useSearchParams` requiere Suspense en App Router, el contenido
va dentro de `<Suspense>`.

Estados de UI:

| Estado        | Cuándo                                   | Qué muestra                                            |
|---------------|------------------------------------------|--------------------------------------------------------|
| `loading`     | resolviendo auth / esperando la mutation | spinner "Vinculando tu cuenta…"                        |
| `missing`     | no hay `token` en la URL                 | "Abrí este link desde el bot de Telegram."             |
| `redirecting` | falta login                              | spinner "Redirigiendo al login…" (dispara el login)    |
| `success`     | mutation 200                             | ✓ "Sesión iniciada con éxito. Podés cerrar la ventana."+ [Volver a Telegram] |
| `error`       | mutation 4xx/5xx                         | mensaje según status + [Reintentar]                    |

Lógica (resumen):

```tsx
"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLinkTelegramMutation } from "@/store/api/telegramApi";

const TG_TOKEN_KEY = "telegram_link_token";

function TelegramLinker() {
  const params = useSearchParams();
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth();
  const [linkTelegram, { isLoading: linking, isSuccess, error }] = useLinkTelegramMutation();
  const triedRef = useRef(false);

  // 1) persistir token apenas carga (sobrevive al redirect de Auth0)
  const token =
    params.get("token") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(TG_TOKEN_KEY) : null);

  useEffect(() => {
    const q = params.get("token");
    if (q) sessionStorage.setItem(TG_TOKEN_KEY, q);
  }, [params]);

  // 2) login si hace falta
  useEffect(() => {
    if (isLoading || !token) return;
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: "/telegram" } });
    }
  }, [isLoading, isAuthenticated, token, loginWithRedirect]);

  // 3) llamar al backend una sola vez ya autenticado
  useEffect(() => {
    if (isAuthenticated && token && !triedRef.current) {
      triedRef.current = true;
      linkTelegram({ token })
        .unwrap()
        .finally(() => sessionStorage.removeItem(TG_TOKEN_KEY));
    }
  }, [isAuthenticated, token, linkTelegram]);

  // ...render por estado (ver tabla)...
}

export default function TelegramPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <TelegramLinker />
    </Suspense>
  );
}
```

Botón "Volver a Telegram": link a `https://t.me/<bot>` (ver §7). Reusar `Button` de
`@/components/ui/button` y el estilo de `login/page.tsx` para mantener consistencia visual.

## 7. Variables de entorno

Agregar (con prefijo `NEXT_PUBLIC_` porque se usan en el cliente):

```
# Usuario del bot para el botón "Volver a Telegram" (sin @)
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

Ya existentes que se reutilizan: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH0_*`,
`NEXT_PUBLIC_DISABLE_AUTH`. En modo `DISABLE_AUTH=true` la página igual funciona: `useAuth`
devuelve un usuario mock y el back no valida el token de Auth0 (pero sí valida el token de
vinculación).

## 8. Casos borde

- **Sin `token`** (entran a `/telegram` a mano) → estado `missing`, no dispara login.
- **Token expirado/alterado** → back devuelve 400 → mensaje claro + botón para volver a
  Telegram y pedir un link nuevo (`/start`).
- **Doble ejecución** (StrictMode / re-render) → `triedRef` evita llamar dos veces.
- **Usuario ya logueado** → saltea el login y va directo a la mutation.
- **Logueado con otra cuenta** → vincula esa cuenta (el back libera el vínculo previo del
  mismo chat). No es un error.

## 9. Validación final (al cerrar la implementación)

```
pnpm lint            # eslint
pnpm build           # next build (typecheck + bundle)
pnpm cy:run          # cypress (si se agregan specs)
```

## 10. Fases de implementación

1. **API:** `src/store/api/telegramApi.ts` con `linkTelegram` + export del hook.
2. **Auth0:** agregar `onRedirectCallback` (returnTo) a `Auth0ProviderWrapper`.
3. **Página:** `src/app/telegram/page.tsx` con la máquina de estados (§6) y la UI (§3 tabla).
4. **Env + botón:** `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` y el deep link a `t.me/<bot>`.
5. **Checks + pulido:** lint y build en verde.

## 11. Coordinación con backend (ya listo)

- Endpoint `POST /users/telegram/link` implementado (body `{ token }`, 200 `{ linked: true }`,
  400 si el token es inválido/expirado).
- El bot arma el link con `FRONTEND_URL` + `/telegram?token=<token>`; verificar que
  `FRONTEND_URL` en el back apunte al mismo origin que sirve esta página.
