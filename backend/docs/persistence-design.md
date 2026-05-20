# Persistencia - decisiones de embebido vs referencia

## Reglas generales

- Todas las entidades persistidas tienen `id: string` mapeado a `_id` (tipo String). `_id` y `__v` no se exponen en entidades ni en respuestas de la API.
- Principio base: los datos que se leen juntos se guardan juntos.
- Preferir embebido para relaciones 1:1 o listas acotadas usadas siempre junto al padre; preferir referencia para 1:N no acotadas o datos compartidos.
- Evitar arrays sin limite y documentos cercanos al limite de 16MB; si una lista puede crecer sin bound, mover a coleccion propia o aplicar patron outlier.
- Stickers, jugadores y clubes NO son catalogo compartido: se permite duplicar por atributos iguales.
- La igualdad de stickers se define por atributos, no por `id`.
- Validaciones de schema con Zod + zod-to-mongoose, reusando schemas existentes (solo ajustar los que terminan en `Response`).

## Decisiones por entidad y relacion

- User -> Collection: embebido en User (1:1, acceso y update atomico, queries de matching).
- Collection.items -> Sticker: embebido como snapshot (no hay catalogo compartido; igualdad por atributos).
- Collection.missingStickers -> Sticker: embebido como snapshot (misma razon).
- Sticker -> Player/Club/NationalTeam/Category: embebido (datos 1:1, se leen juntos).
- Post -> owner: referencia por `ownerId` (evita duplicar datos de usuario).
- Post -> sticker: embebido (sticker como value object).
- Post -> offers: referencia (ofertas en coleccion separada) para evitar arrays no acotadas y reducir riesgo de 16MB.
- Offer -> post: referencia por `postId` y `postOwnerId` denormalizado (patron extended reference) para filtrar "received" sin lookup; Offer -> offerer: referencia por `offererId`.
- Offer -> offered items: embebido como array de `{ sticker, quantity }` (datos propios de la oferta, lista acotada).
- Rating -> reviewer/reviewee: referencia por `reviewerId` y `revieweeId` (1:N no acotada, consultas por usuario y crecimiento continuo).
- Notification -> userId: referencia; `payload` embebido (datos pequenos y especificos). Considerar TTL o archive si el volumen crece.
- Matching: no coleccion propia; consultas sobre `users.collection.items` y `users.collection.missingStickers` con indices (evita antipatron de colecciones innecesarias).
