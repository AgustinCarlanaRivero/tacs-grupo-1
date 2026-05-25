import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(__dirname, "../../config/.env.dev") })

// Keep this list in sync with config/.env.example
const requiredEnvKeys = [
	"NODE_ENV",
	//"MONGO_URI",
	//"MONGODB_DB_NAME",
	"AUTH0_ISSUER_BASE_URL",
	"AUTH0_AUDIENCE",
]

const missingEnvKeys = requiredEnvKeys.filter((key) => {
	const value = process.env[key]
	return typeof value !== "string" || value.trim().length === 0
})

if (missingEnvKeys.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvKeys.join(", ")}`
	)
}
