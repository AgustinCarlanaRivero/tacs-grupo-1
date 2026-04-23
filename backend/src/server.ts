import './config/env'
import app from './app/app'

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`)
})
