import './config/env'
import app from './app/app'

const URL = process.env.URL ?? "http://localhost:3000"
const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
    console.log(`Backend running on ${URL}`)
    console.log(`Swagger docs available at ${URL}/docs`)
})
