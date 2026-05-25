import app from './app/app'
import './config/env'
// import { connectMongo, disconnectMongo } from './infra/database/connection'
import { seedData } from './modules/data'

const URL = process.env.URL ?? "http://localhost:3000"
const PORT = process.env.PORT ?? 3000

async function startServer() {
    //await connectMongo()
    await seedData()

    const server = app.listen(PORT, () => {
        console.log(`Backend running on ${URL}`)
        console.log(`Swagger docs available at ${URL}/docs`)
    })

    let shuttingDown = false

    const shutdown = async (signal: NodeJS.Signals) => {
        if (shuttingDown) return
        shuttingDown = true

        console.log(`Received ${signal}. Shutting down...`)

        try {
            await new Promise<void>((resolve) => {
                server.close(() => resolve())
            })
            //await disconnectMongo()
        } catch (error) {
            console.error("Failed to shutdown cleanly", error)
        } finally {
            process.exit(0)
        }
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
}

startServer().catch((error) => {
    console.error("Failed to start backend", error)
    process.exit(1)
})
