FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build \
 && cp -r .next/static .next/standalone/.next/static \
 && cp -r public .next/standalone/public
ENV HOSTNAME=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
