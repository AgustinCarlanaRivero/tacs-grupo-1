# Plan de implementación — Bot de Telegram

> Estado: propuesta. Pendiente de aprobación antes de implementar.

## 1. Objetivo y alcance

Sumar un **bot de Telegram clásico** como **segunda capa de presentación** del backend,
sin tocar la lógica de negocio existente. El bot:

- **Consulta (read-only):** responde comandos que leen datos del sistema
  (publicaciones, mis publicaciones, mis notificaciones, una figurita puntual).
- **Notificaciones (push):** entrega por Telegram los mismos eventos de dominio que
  ya emite el módulo de notificaciones (ofertas, ratings, figuritas disponibles, etc.).

Fuera de alcance (decisión de diseño — "bot clásico de consulta"):

- No crea publicaciones, ofertas ni ratings desde Telegram (nada de escritura de dominio).
- No reemplaza la API HTTP ni el frontend; es una capa adicional.

Librería: **[grammY](https://grammy.dev/)** (framework de bots para Node/TypeScript).

## 2. Principio de diseño

El bot **no contiene lógica de negocio**. Cada handler:

1. Resuelve qué usuario de la app está detrás del chat de Telegram (ver §4).
2. Llama a un **service existente** (`PostService`, `notificationService`, `UserService`, …).
3. Formatea la respuesta en texto/Markdown de Telegram.

Esto respeta la separación controller/service del repo: los handlers de Telegram
juegan el rol de "controllers" de una nueva capa de presentación, igual que los
controllers HTTP de Express.

## 3. Estructura de archivos

**Sin módulo `telegram` propio.** Cada módulo gana una subcarpeta `telegram/` con sus
handlers/formatters; la infraestructura del bot va a `infra/telegram/`, la composición de
comandos a `routes/`, y los utilitarios compartidos a `shared/utils/`.

```
src/infra/telegram/
  bot.ts                 # crea el Bot de grammY (singleton); startTelegramBot()/stopTelegramBot()

src/routes/
  bot-commands.ts        # composición: importa y registra los comandos de cada módulo en el bot

src/modules/auth/
  telegram-auth.middleware.ts  # resuelve el User desde ctx.chat.id; si no está vinculado, manda el link de login

src/shared/utils/
  link-token.ts          # firma/valida el token de chat (HMAC + expiración) y arma la URL de login del front
  format.ts              # helpers de formato Markdown (opcional)

src/modules/posts/telegram/
  post.commands.ts       # registerPostCommands(bot): /publicaciones, /mispublicaciones, /figurita -> PostService
  post.formatter.ts

src/modules/notifications/channels/
  telegram.channel.ts    # implements NotificationChannel; usa el bot para enviar (push)

src/modules/notifications/telegram/
  notification.commands.ts  # registerNotificationCommands(bot): /notificaciones -> notificationService
  notification.formatter.ts

src/modules/users/
  user.controller.ts     # (existente) + handler del endpoint de vinculación: valida token + Auth0 -> guarda telegramChatId
  routes/user.routes.ts  # (existente) + ruta POST /users/telegram/link
```

`routes/bot-commands.ts` cumple el mismo rol que el actual `src/routes/index.ts`: es la **raíz
de composición** que conoce a todos los módulos y los conecta. Cada módulo expone
`registerXxxCommands(bot)` y `bot-commands.ts` los invoca, así la infraestructura del bot no
depende de los módulos salvo en ese único archivo de wiring (mismo patrón que ya usamos con
las rutas HTTP).

## 4. Vinculación usuario ↔ chat de Telegram (propuesta detallada)

El problema: Telegram solo conoce el `chatId`; el backend identifica usuarios por Auth0.
Hay que atar `chatId -> User.id` sin que el usuario copie y pegue nada.

### Flujo

1. **Bot → usuario.** Ante cualquier mensaje de un chat no vinculado, el bot arma un
   **token de un solo uso** que contiene el `chatId` + expiración (firmado con HMAC, ver
   `link-token.ts`) y lo mete en la URL del front:
   `https://<front>/telegram?token=<token>`
   Responde: *"¡Hola coleccionista! Para ayudarte con tu solicitud, primero iniciá sesión: <link>"*.

2. **Front: login + bind.** La página `/telegram` lee `token` del query string, dispara el
   login de Auth0 y, ya autenticado, llama al backend:
   `POST /users/telegram/link` con `Authorization: Bearer <auth0Token>` y body `{ token }`.

3. **Backend: persiste el vínculo.**
   - Valida el `token` (firma + no expirado) → extrae el `chatId`.
   - Resuelve el `userId` desde el token de Auth0 (middleware de auth que ya existe).
   - Guarda `telegramChatId = chatId` en el `User`.
   - Responde 200. La página muestra *"Sesión iniciada con éxito. Puede cerrar esta ventana."*
     (con botón "Volver a Telegram" → `https://t.me/<bot>`).

4. **Usuario vuelve a Telegram.** En **cada** mensaje el bot lee `ctx.chat.id` y hace
   `userRepository.findByTelegramChatId(chatId)`:
   - Encontrado → autenticado, ejecuta el comando.
   - No encontrado → vuelve a mandar el link de login.

### Cambios necesarios

- **Entidad `User`** (`src/modules/users/entities/user.entity.ts`) + schema/modelo Mongo:
  agregar `telegramChatId?: string`. Actualizar `backend/class-diagram.puml`.
- **Repositorio de usuarios:** `findByTelegramChatId(chatId)`.
- **`shared/utils/link-token.ts`:** `signLinkToken(chatId)` y `verifyLinkToken(token)`.
- **`users/user.controller.ts` + `users/routes/user.routes.ts`:** agregar el handler y la ruta
  `POST /users/telegram/link` (endpoint del paso 2/3), sin archivos nuevos.

## 5. Comandos de consulta (read-only)

Todos pasan por `modules/auth/telegram-auth.middleware.ts`; si el chat no está vinculado
responden con el link de login (§4, paso 1).

| Comando                  | Service que llama                                  | Respuesta                              |
|--------------------------|----------------------------------------------------|----------------------------------------|
| `/start`, `/help`        | —                                                  | Texto de ayuda + estado de vinculación |
| `/publicaciones`         | `PostService.listPosts({ page, limit })`           | Lista paginada de publicaciones        |
| `/mispublicaciones`      | `PostService.listPostsByOwner(userId, filters)`    | Publicaciones del usuario              |
| `/figurita <numero>`     | `StickerService` / `PostService.listPosts(query)`  | Detalle / publicaciones de esa figurita|
| `/notificaciones`        | `notificationService.getByUserId(userId)`          | Últimas notificaciones (no leídas)     |

Las firmas ya existen (`post.service.ts`, `notification.service.ts`); el bot solo las consume.
Debe haber paginación con botones inline "siguiente".

## 6. Canal de notificaciones (push)

`notifications/channels/telegram.channel.ts` implementa la interfaz ya definida (al lado de
`in-app.channel.ts`):

```ts
export interface NotificationChannel {
  send(notification: Notification): Promise<void>
}
```

`send(notification)`:

1. Busca el usuario por `notification.userId`.
2. Si no tiene `telegramChatId`, no hace nada (no todos usan Telegram).
3. Si lo tiene, formatea (`notification.formatter.ts`) y envía con el bot.
4. **No lanza** si Telegram falla: captura y loguea.

Registro en el boot:

```ts
notificationService.addChannel(new TelegramChannel(bot))
```

Con esto, **todos los eventos del facade** (`offerReceived`, `stickerAvailable`,
`auctionEnding`, etc.) salen también por Telegram sin tocar los módulos que los disparan.
Es el punto de extensión que ya documenta `src/modules/notifications/README.md`.

### Aislar cada canal en `notify`

Hoy `notificationService.notify` usa `Promise.all`, así que si un canal lanza, corta a los
demás. Cambiar a entrega aislada: envolver cada `channel.send` en try/catch (o
`Promise.allSettled`) y loguear el error sin propagarlo, para que un canal caído no afecte a
los otros (ej.: si Telegram falla, el in-app igual se entrega).

## 7. Integración en el arranque del server

En `src/server.ts`, después de `connectMongo()`:

- `await startTelegramBot()` → crea el bot, llama a `routes/bot-commands.ts`, registra el
  `TelegramChannel` y arranca el long-polling (`bot.start()`).
- En `shutdown()`: `await stopTelegramBot()` (`bot.stop()`).
- Si `TELEGRAM_BOT_TOKEN` no está seteado, **no arranca el bot** y loguea un warning. El
  backend sigue funcionando sin bot (dev/test/CI).

Recepción de updates: **long polling** (sin webhook). Lo más simple para el TP; no requiere URL pública.

## 8. Variables de entorno

Agregar a `config/.env.example`:

```
# Telegram bot (opcional; si falta, el bot no arranca)
TELEGRAM_BOT_TOKEN=
# Base del front para armar el link de login del bot (también opcional; si falta, el bot no arranca)
FRONTEND_URL=
# Secreto HMAC para firmar el token de vinculación (también opcional; si falta, se usa TELEGRAM_BOT_TOKEN)
TELEGRAM_LINK_SECRET=
```

**No** agregar estas claves a `requiredEnvKeys` en `src/config/env.ts` (el bot es opcional);
validarlas dentro de `startTelegramBot()` / `link-token.ts`.

## 9. Dependencias

```
pnpm add grammy
```

grammY trae sus propios tipos TS.

## 10. Fases de implementación

1. **Infra base:** dependencia, env vars, `infra/telegram/bot.ts`, `routes/bot-commands.ts`,
   arranque/parada en `server.ts`, con `/start` y `/help`. Verificar conexión con BotFather.
2. **Vinculación:** `telegramChatId` en User (+ modelo + repo + puml), `shared/utils/link-token.ts`,
   `modules/auth/telegram-auth.middleware.ts`, endpoint `POST /users/telegram/link` en
   `user.controller.ts` + `user.routes.ts`, y el primer mensaje con link de login. Coordinar con
   frontend la página `/telegram`.
3. **Consultas:** `posts/telegram` y `notifications/telegram` (comandos) + formatters.
4. **Notificaciones push:** `notifications/channels/telegram.channel.ts` + registro en boot + aislar `notify`.
5. **Tests y pulido.**
6. **Validación final (obligatoria):** correr typecheck, lint y la suite completa, y **arreglar
   todo lo que rompa** antes de dar por terminado (ver §11).

## 11. Testing y validación final

**Tests a agregar:**

- **Unit:** `link-token` (firma válida / expirada / alterada), formatters, y
  `TelegramChannel.send` (usuario sin chat → no envía; con chat → llama al bot mockeado;
  fallo de Telegram → no propaga). Mockear `bot`/repos como en los tests de servicios ya migrados.
- No se testea grammY en sí; se testea nuestra lógica de capa.

**Validación final obligatoria** (al cerrar la implementación, antes de dar por terminado):

```
npx tsc --noEmit     # typecheck
pnpm lint            # eslint . --ext .ts
pnpm test            # suite completa (jest)
```

Los tres deben pasar en verde. **Arreglar todo lo que rompa**: varios de los cambios de este
plan (campo `telegramChatId` en `User`, `notify` aislado, nuevos imports/exports) probablemente
rompan tests existentes y/o el tipado. No se considera terminada la tarea hasta que typecheck,
lint y tests pasen sin errores.

## 12. Consideraciones / riesgos

- **Privacidad:** un chat solo consulta datos del usuario que vinculó; el middleware lo
  garantiza resolviendo siempre el `userId` desde el `chatId`.
- **Seguridad del bind:** el token de login es de un solo uso, expira corto y va firmado;
  evita atar un chat ajeno a una cuenta.
- **Rate limits de Telegram:** irrelevante al volumen del TP.
- **Una sola instancia:** long polling asume un único proceso del bot corriendo (ok para el TP).
- **Dependencia front:** la página `/telegram` (lee `token`, hace login, llama al endpoint de
  bind y muestra el mensaje de éxito) es trabajo del frontend; hay que coordinarlo.
