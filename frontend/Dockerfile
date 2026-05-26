FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build \
 && cp -r .next/static .next/standalone/.next/static \
 && cp -r public .next/standalone/public
ENV HOSTNAME=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
