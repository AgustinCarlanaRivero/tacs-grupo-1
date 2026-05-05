/**
 * Agrega los paths OpenAPI de cada modulo via imports side-effect.
 * No exporta nada: solo dispara `registry.registerPath()`.
 */
import "../health/health.paths"

import "../../modules/auth/openapi/auth.paths"
import "../../modules/admin/openapi/admin.paths"
import "../../modules/users/openapi/users.paths"
import "../../modules/collection/openapi/collection.paths"
import "../../modules/posts/openapi/posts.paths"
import "../../modules/offers/openapi/offers.paths"
import "../../modules/ratings/openapi/ratings.paths"
import "../../modules/stickers/openapi/stickers.paths"
import "../../modules/notifications/openapi/notifications.paths"
import "../../modules/matching/openapi/matching.paths"
