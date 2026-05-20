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
- Generar schemas Mongoose con zod-to-mongoose.
- Configurar `_id: String` y `versionKey: false`.
- Agregar `toJSON/toObject` para exponer `id` y eliminar `_id` y `__v`.
- Agregar validaciones en schema (requeridos, enums, rangos) y, si aplica, validator `$jsonSchema` en colecciones.

3. Ajustes en entidades de dominio

- Asegurar `id: string` en todas las entidades persistidas (por ejemplo Sticker y Post/Offer/Rating/Notification si faltara).
- Mantener `number` en Sticker como dato de negocio, no como id.

4. Repositorios persistentes

- Reemplazar Maps por modelos Mongoose y metodos async.
- Crear un repositorio base abstracto (BaseRepository) con CRUD comun, paginacion, mapeo doc -> entidad y configuracion de populate default.
- Los repositorios deben devolver entidades de dominio ya hidratadas (mapear docs a clases de dominio). Encapsular `populate` en el base repo con un helper `hydrate()`.
- OfferRepository: eliminar `OfferRecord`; persistir `postId`, `postOwnerId`, `offererId`, `offered` (y los otros datos de Offer).
- PostRepository: persistir solo datos del post (sin `offers` embebidos); consultar ofertas por repositorio separado.
- CollectionRepository: operar sobre `User.collection` embebido (update con `$set/$push/$pull`).
- MatchingRepository: eliminar indices en memoria y usar queries Mongo.
- Stickers se tratan como value objects embebidos (no catalogo compartido).
- Confirmar que no haya arrays sin limite; si aparece un outlier (colecciones gigantes), mover items a coleccion dedicada.

5. Servicios y queries

- Convertir servicios a async/await y adaptar paginacion a queries en BD.
- Reemplazar `findAll()` por queries filtradas y paginadas.
- Los servicios consumen entidades de dominio; el `populate` es automatico desde BaseRepository y solo aplica a referencias (los embebidos ya vienen completos).

6. Indices

- Users: `collection.items.sticker.number`, `collection.missingStickers.number`, `reputation`.
- Offers: `postId`, `postOwnerId`, `offererId`, `state`, `createdAt`.
- Posts: `ownerId`, `state`, `type`, `createdAt`.
- Ratings: `revieweeId`, `reviewerId`.
- Notifications: `userId`, `read`, `createdAt`.
- Validar que los indices respondan a queries reales y evitar indices innecesarios.

7. Seeds y tests

- Migrar seeds a un script para Mongo, que lo ejecutará el usuario luego, de manera independiente. Luego, borrar del código todo lo relacionado a las seeds.
- TODOS los tests deben ahora mockear los repositorios, y deben respetar la nueva interfaz de los mismos.

8. Verificacion

- Ajustar respuestas API para no exponer `_id`/`__v`.
- Re-ejecutar tests y verificar endpoints de posts/offers/ratings/notifications/matching.
- Revisar tamano de documentos (especialmente `users` por `collection`) para no acercarse al limite de 16MB.