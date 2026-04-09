import express from "express"
import cors from "cors"
import { errorHandler } from "./middlewares/errorHandler.ts";
import healthRoutes from "./infra/health/healthRoutes.ts";
import swaggerRoutes from "./infra/swagger/swaggerRoutes.ts";

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

app.use(errorHandler)

export default app