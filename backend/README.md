# Backend Node (Express + Oracle)

API en Node/Express para reemplazar el backend PHP usando la misma base Oracle.

## Configuración
1. Copia `.env.example` a `.env` y ajusta:
   - `APP_KEY` para firmar tokens (HMAC).
   - `DB_HOST`, `DB_PORT`, `DB_SERVICE`, `DB_USER`, `DB_PASSWORD`, `DB_CHARSET`.
   - `CORS_ORIGIN` para el frontend (ej. `http://localhost:5173`).
   - `ADMIN_ROLES` lista separada por comas (por defecto `ADMIN,ADMINISTRADOR`).
   - `PORT` (3000 por defecto).
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Arranca en modo dev:
   ```bash
   npm run dev       # hot reload con nodemon
   ```
   o en modo normal:
   ```bash
   npm start
   ```
La API quedará en `http://localhost:3000/api` (cambia `PORT` si necesitas otro).

## Notas Oracle
- Se conecta a la misma base y tabla de usuarios (`JRGY_USUARIO`).  
- Al iniciar crea la tabla `TOKENS` si no existe (FK a `JRGY_USUARIO(COD_USUARIO)`).
- `node-oracledb` requiere librerías cliente Oracle (Instant Client). Si aparece `DPI-1047`, instala las librerías y exporta `LD_LIBRARY_PATH` según la guía oficial.

## Endpoints
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`.
- CRUD de usuarios: `GET|POST /api/users`, `GET|PUT|DELETE /api/users/:id` (requiere rol admin).
- Roles: `GET|POST /api/roles`, `DELETE /api/roles/:id` (admin).
- Solicitudes admin: `POST /api/admin/requests`, `GET /api/admin/requests`, `POST /api/admin/requests/:id/(approve|reject)`.
- Salud: `GET /api/ping`, `GET /api/test_oracle`.
