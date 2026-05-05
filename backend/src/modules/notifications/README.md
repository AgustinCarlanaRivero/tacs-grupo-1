# Módulo Notifications

Provee notificaciones in-app para los eventos de dominio del sistema (ofertas, subastas, ratings, etc.). Está diseñado para que los demás módulos disparen eventos sin acoplarse al detalle de canales/mensajes.

## API pública

### Facade (recomendado)

`services/notification.facade.ts` expone un objeto `notifications` con un método por evento de dominio. **Es la única dependencia que deberías importar desde otros módulos.**

```ts
import { notifications } from "../../notifications/services/notification.facade"

// Después de persistir la oferta:
await notifications.offerReceived(postOwnerId, {
    offerId: offer.id,
    postId: post.id,
    fromUserId: offererId,
})
```

Eventos disponibles:

| Método                  | Cuándo dispararlo                                                       | Destinatario           |
|-------------------------|--------------------------------------------------------------------------|------------------------|
| `offerReceived`         | Después de crear una oferta nueva                                        | Dueño de la publicación |
| `offerAccepted`         | Después de marcar la oferta como aceptada                                | Quien hizo la oferta    |
| `offerRejected`         | Después de marcar la oferta como rechazada                               | Quien hizo la oferta    |
| `stickerAvailable`      | Cuando aparece publicada una figurita que el usuario tiene como faltante | Cada usuario interesado |
| `auctionEnding`         | Cuando una subasta de interés está por terminar (job programado)         | Cada usuario interesado |
| `ratingReceived`        | Después de persistir una calificación                                    | El usuario calificado   |

### Service (avanzado)

Si necesitás un tipo de notificación que no está en el facade, podés importar `notificationService` directamente y llamar `notify(userId, type, message, payload)`. **Antes de hacerlo, considerá agregar un método al facade** para mantener la API ordenada.

## Canales

Hoy hay un único canal (`InAppChannel`) que persiste la notificación y la emite por SSE. Para sumar canales (email, telegram, push) basta con implementar `NotificationChannel` y registrarlo en boot:

```ts
notificationService.addChannel(new TelegramChannel())
```

Cualquier `notify` posterior va a despachar por todos los canales en paralelo.

## Endpoints HTTP

| Método | Path                                          | Quién puede                |
|--------|-----------------------------------------------|----------------------------|
| GET    | `/users/:userId/notifications`         | El propio usuario o admin  |
| GET    | `/users/:userId/notifications/stream`  | El propio usuario o admin  |
| GET    | `/notifications/unread-count`          | El usuario autenticado     |
| PATCH  | `/notifications/:id/read`              | El dueño de la notificación |
| PATCH  | `/notifications/read-all`              | El usuario autenticado     |

`/stream` es un Server-Sent Events: el cliente recibe cada notificación en tiempo real (más un comentario `: ping` cada 25s para mantener viva la conexión).

## Persistencia

In-memory por ahora (`notification.repository.ts`). Cuando se migre a Mongo, sólo hay que reemplazar la implementación del repo manteniendo la firma — el resto del módulo no cambia.
