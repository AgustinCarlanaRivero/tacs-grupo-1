import cors from "cors";
import express from "express";
import healthRoutes from "../infra/health/health.routes";
import swaggerRoutes from "../infra/swagger/swagger.routes";
import apiRoutes from "../routes/index";
import { ForbiddenError } from "../shared/errors/http-errors";
import { errorHandler } from "../shared/middleware/error.middleware";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://stickersfront.matenote.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
        return callback(null, true);
      }
      return callback(new ForbiddenError("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

app.use("/health", healthRoutes);
app.use("/docs", swaggerRoutes);
app.use("/", apiRoutes);

app.use(errorHandler);

export default app;
