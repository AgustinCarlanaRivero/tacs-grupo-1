import dotenv from 'dotenv'
import app from './app'

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
dotenv.config({ path: envFile })
console.log(`Environment: ${process.env.NODE_ENV}`)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`)
})