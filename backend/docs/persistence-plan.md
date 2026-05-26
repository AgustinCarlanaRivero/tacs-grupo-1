# Plan de implementacion - mongoose + zod-to-mongoose

## Objetivo

- Reemplazar repositorios in-memory por persistencia Mongo con Mongoose, reutilizando schemas Zod y respetando `id: string` mapeado a `_id`.

## Pasos

1. Infra Mongo

- Crear modulo de conexion en `backend/src/infra/database/mongo` (connect/disconnect, manejo de errores).
- Leer `MONGO_URI` y `MONGODB_DB_NAME` desde env y conectar al boot de la app.

2. Schemas Zod de persistencia y modelos Mongoose

- Definir schemas Zod de persistencia por modulo (User, Sticker, Post, Offer, Rating, Notification), reusando sub-schemas existentes.
- Validacion con Zod + zod-to-mongoose. Reusar los schemas actuales y solo ajustar los que terminan en `Response`.
- Generar schemas Mongoose con `generateRawSchema()`.
- Configurar `_id: ObjectId` y `versionKey: false`.
- Agregar `toJSON/toObject` para exponer `id` y eliminar `_id` y `__v`.
- Usar `loadClass` + `toJSON` para mapear persistence -> response (ocultar `auth0Sub`, mapear refs y embebidos; fechas quedan como ISO en JSON).
- Agregar validaciones en schema (requeridos, enums, rangos) y, si aplica, validator `$jsonSchema` en colecciones.

3. Ajustes en entidades de dominio

- Asegurar `id: string` en todas las entidades persistidas (por ejemplo Sticker y Post/Offer/Rating/Notification si faltara).
- Mantener `number` en Sticker como dato de negocio, no como id.
- Actualizá el diagrama de clases con estos cambios

4. Base repository

- Crear un repositorio base abstracto (BaseRepository) con CRUD comun, paginacion, mapeo doc -> entidad y configuracion de populate default.
- Todos los repositorios usaran los modelos Mongoose ya creados y metodos async, en vez de los Maps que usaban antes.
- Algunos repositorios deben poblar algunos atributos. Encapsular `populate` en el base repo con un helper `hydrate()`.
- Soportar perfiles de carga del agregado (por ejemplo `base` vs `withOffers`) para poblar solo cuando haga falta.

5. Cambios en repositorios específicos

- Ahora estos heredarán del BaseRepository
- Definir populate default para Post/Offer (owner/offerer con `username`) para que el `toJSON` exponga `{ id, username }`.
- En Post/Offer usar `populate({ path: "owner|offerer", select: "_id username" })`.
- OfferRepository: eliminar `OfferRecord`; persistir `postId`, `postOwnerId`, `offererId`, `offered` (y los otros datos de Offer) como campos de persistencia/read-model.
- PostRepository: persistir solo datos del post (sin `offers` embebidos).
- PostRepository: exponer `findById()` (sin offers) y `findByIdWithOffers()` (con `populate("offers")` sobre virtual) para hidratar el agregado solo en casos de negocio.
- PostModel: mantener `offers` como virtual populate (`localField: "_id"`, `foreignField: "postId"`) y no como campo persistido en `posts`.
- CollectionRepository: operar sobre `User.collection` embebido (update con `$set/$push/$pull`).
- MatchingRepository: eliminar indices en memoria y usar queries Mongo.
- En auth (lookup por `auth0Sub`), usar `.select("+auth0Sub")` cuando el campo sea necesario.
- Stickers se tratan como value objects embebidos (no catalogo compartido).
- Confirmar que no haya arrays sin limite; si aparece un outlier (colecciones gigantes), avisame.

6. Indices

- Users: `collection.items.sticker.number`, `collection.missingStickers.number`, `reputation`.
- Offers: `postId`, `postOwnerId`, `offererId`, `state`, `createdAt`.
- Posts: `ownerId`, `state`, `type`, `createdAt`.
- Ratings: `revieweeId`, `reviewerId`.
- Notifications: `userId`, `read`, `createdAt`.

7. Servicios y queries

- Convertir servicios a async/await y adaptar paginacion a queries en BD.
- Reemplazar `findAll()` por queries filtradas y paginadas.
- Los servicios consumen entidades de dominio; el `populate` es automatico desde BaseRepository y solo aplica a referencias (los embebidos ya vienen completos).
- En flujos que aplican reglas de dominio de `Post` sobre ofertas (`addOffer`, `approveOffer`, `rejectOffer`, `cancelOffer`), usar `findByIdWithOffers()` en vez de `findById()`.
- Validar que los indices respondan a queries reales y evitar indices innecesarios.

8. Seeds

- Migrar seeds a un script para Mongo, que lo ejecutará el usuario luego, de manera independiente. Luego, borrar del código todo lo relacionado a las seeds.

9. Tests

- TODOS los tests deben ahora mockear los repositorios, y deben respetar la nueva interfaz de los mismos.

10. Verificacion

- Re-ejecutar tests y verificar endpoints de posts/offers/ratings/notifications/matching.
- Revisar tamano de documentos (especialmente `users` por `collection`) para no acercarse al limite de 16MB.
