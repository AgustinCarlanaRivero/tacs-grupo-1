import fs from "fs";
import path from "path";

const backendEnvPath = path.resolve("../backend/config/.env.dev");

function readBackendEnv() {
    if (!fs.existsSync(backendEnvPath)) return {};

    return Object.fromEntries(
        fs
            .readFileSync(backendEnvPath, "utf8")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(
                (line) => line && !line.startsWith("#") && line.includes("=")
            )
            .map((line) => {
                const [key, ...valueParts] = line.split("=");
                return [key, valueParts.join("=").replace(/^["']|["']$/g, "")];
            })
    );
}

const backendEnv = readBackendEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    env: {
        NEXT_PUBLIC_DISABLE_AUTH:
            process.env.NEXT_PUBLIC_DISABLE_AUTH ??
            backendEnv.DISABLE_AUTH ??
            "false",
        NEXT_PUBLIC_MOCK_USER_ID:
            process.env.NEXT_PUBLIC_MOCK_USER_ID ??
            backendEnv.MOCK_USER_ID ??
            "665000000000000000000002",
        NEXT_PUBLIC_MOCK_USER_ROLE:
            process.env.NEXT_PUBLIC_MOCK_USER_ROLE ??
            backendEnv.MOCK_USER_ROLE ??
            "STANDARD",
    },
};

export default nextConfig;
