# --- Etapa 1: instalar dependencias ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Etapa 2: imagen final ---
FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8000
ENV NODE_ENV=production
ENV PORT=8000
CMD ["node", "--experimental-strip-types", "src/server.ts"]
