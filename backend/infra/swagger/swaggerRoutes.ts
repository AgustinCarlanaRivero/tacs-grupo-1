import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

readFile(path.join(__dirname, '../api-docs.yaml'), 'utf8')
    .then(file => {
        const swaggerDocument = YAML.parse(file)
        router.use('/', swaggerUi.serve)
        router.get('/', swaggerUi.setup(swaggerDocument))
    })
    .catch(err => {
        console.error('Error cargando api-docs.yaml:', err)
    })

export default router