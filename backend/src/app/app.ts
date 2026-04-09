import express from "express"
import cors from "cors"
import { errorHandler } from "../shared/middleware/error.middleware.ts"
import healthRoutes from "../infrastructure/health/healthRoutes.ts"
import swaggerRoutes from "../infrastructure/swagger/swaggerRoutes.ts"
import apiRoutes from "../routes/index.ts"

const app = express()

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (origin.endsWith(".netlify.app") || origin.startsWith("http://localhost")) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())

app.use("/health", healthRoutes)
app.use("/docs", swaggerRoutes)
app.use("/api/v1", apiRoutes)

app.use(errorHandler)

export default app
