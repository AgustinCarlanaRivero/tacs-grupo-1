# TACS Grupo 1

Aplicación web con **backend** (Express + TypeScript) y **frontend** (Next.js), orquestados con Docker Compose.

---

## Estructura

```
├── backend/
│   ├── Dockerfile          # Imagen Node 22 – API Express
│   └── src/server.ts       # Punto de entrada
├── frontend/
│   ├── Dockerfile          # Imagen Node 22 – Next.js
│   └── src/app/            # Páginas de Next.js
├── docker-compose.yml      # Orquesta ambos servicios
└── README.md
```

| Servicio   | Puerto | Imagen base      | Tecnología          |
|------------|--------|------------------|---------------------|
| `backend`  | 8000   | `node:22-alpine` | Express + TypeScript |
| `frontend` | 3000   | `node:22-alpine` | Next.js + React     |

---

## Cómo funciona cada Dockerfile

### Backend

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                              # Instala dependencias
COPY . .                                # Copia el código fuente
EXPOSE 8000
CMD ["npm", "start"]                    # Ejecuta: npx tsx src/server.ts
```

- Usa **tsx** para ejecutar TypeScript directamente sin necesidad de compilar.
- `npm ci` instala las dependencias exactas del lockfile (más rápido y determinístico que `npm install`).

### Frontend

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                              # Instala dependencias
COPY . .
RUN npm run build                       # Compila Next.js (next build)
EXPOSE 3000
CMD ["npm", "start"]                    # Ejecuta: next start
```

- `npm run build` genera la versión de producción optimizada de Next.js.
- `npm start` sirve esa versión compilada en el puerto 3000.

---

## Desarrollo local (sin Docker)

### 1. Variables de entorno

**Backend** — crear `backend/config/.env.dev`:
```env
NODE_ENV=development
PORT=3000
AUTH0_ISSUER_BASE_URL=https://fake.auth0.com/
AUTH0_AUDIENCE=https://fake-api
DISABLE_AUTH=true
MOCK_USER_ID=seed-user-ana
MOCK_USER_ROLE=ADMIN
```

**Frontend** — crear `frontend/.env.local`:
```env
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Con `DISABLE_AUTH=true` no se necesitan credenciales reales de Auth0. El backend inyecta el usuario mock en cada request y el frontend muestra la UI como autenticado.

### 2. Levantar backend

```bash
cd backend
npm install
npm run dev    # corre en localhost:3000
```

### 3. Levantar frontend

```bash
cd frontend
npm install
npm run dev    # corre en localhost:3001
```

---

## Tests E2E (Cypress)

Los tests requieren que **ambos servidores estén corriendo** (backend en `:3000`, frontend en `:3001`) con los `.env` de desarrollo configurados.

```bash
cd frontend

# Modo interactivo (GUI — recomendado para debuggear)
npm run cy:open

# Modo headless (CI)
npm run cy:run
```

### Cobertura de tests

| Archivo | Qué testea | Datos |
|---|---|---|
| `auth.cy.ts` | Login, rutas protegidas, nav | Mock user (Ana Lopez, ADMIN) |
| `coleccion.cy.ts` | Mi Colección, Figuritas Faltantes | Seed real del back |
| `subastas.cy.ts` | Tabs, Mis subastas, modal Publicar/Pujar | Seed real + mock para mercado* |
| `intercambios.cy.ts` | Tabs, Mis intercambios, Sugerencias, modal | Seed real + mock para mercado* |
| `admin.cy.ts` | Dashboard stats, gestión de usuarios, filtros | Seed real del back |

> *El tab "Mercado" usa mock porque `GET /users/:id/posts` solo devuelve posts propios, no de otros usuarios.

---

## Comandos

### Levantar todo el proyecto

```bash
docker-compose up --build
```

- `--build` reconstruye las imágenes si hubo cambios en el código.
- Agrega `-d` para correr en segundo plano:

```bash
docker-compose up --build -d
```

### Levantar un solo servicio

```bash
docker-compose up backend       # Solo la API
docker-compose up frontend      # Solo el front
```

### Ver logs

```bash
docker-compose logs -f              # Todos
docker-compose logs -f backend      # Solo backend
docker-compose logs -f frontend     # Solo frontend
```

### Detener todo

```bash
docker-compose down
```

### Rebuild sin cache

```bash
docker-compose build --no-cache
```

---

## Buildear una imagen individualmente (sin Compose)

```bash
# Backend
docker build -t tacs-backend ./backend
docker run -p 8000:8000 tacs-backend

# Frontend
docker build -t tacs-frontend ./frontend
docker run -p 3000:3000 tacs-frontend
```

---

## Variables de entorno

Definidas en `docker-compose.yml`:

| Variable              | Servicio  | Descripción                              |
|-----------------------|-----------|------------------------------------------|
| `NODE_ENV`            | backend   | Entorno de ejecución (`production`)      |
| `PORT`                | backend   | Puerto del servidor Express              |
| `AUTH0_ISSUER_BASE_URL` | backend | Issuer del tenant de Auth0 (ej. `https://dev-xxx.us.auth0.com`) |
| `AUTH0_AUDIENCE`      | backend   | Audience del API en Auth0                |
| `NEXT_PUBLIC_API_URL` | frontend  | URL del backend (para llamadas a la API) |

---

## Configuración de Auth0

Pendientes a configurar en el Auth0 Dashboard:

1. Agregar `https://oauth.pstmn.io/v1/callback` como **Allowed Callback URL** en la Application (para probar desde Postman).
2. Crear el API con **audience** `https://api.tacs-figuritas.com`.
3. Si se requiere disponer de `email` / `name` en el access token, configurar una Action/Rule que los agregue como custom claims (Auth0 no los incluye por defecto).

---

## Comandos útiles de Docker

```bash
docker ps                      # Ver contenedores corriendo
docker images                  # Ver imágenes descargadas/buildeadas
docker container prune          # Eliminar contenedores detenidos
docker image prune              # Eliminar imágenes sin uso
docker system prune -a          # Limpieza completa
```
