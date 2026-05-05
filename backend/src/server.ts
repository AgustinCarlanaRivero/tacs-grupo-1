import './config/env'
import app from './app/app'
import { seedData } from './modules/data'

const URL = process.env.URL ?? "http://localhost:3000"
const PORT = process.env.PORT ?? 3000

async function startServer() {
    await seedData()

    app.listen(PORT, () => {
        console.log(`Backend running on ${URL}`)
        console.log(`Swagger docs available at ${URL}/docs`)
    })
}

startServer().catch((error) => {
    console.error("Failed to start backend", error)
    process.exit(1)
})
