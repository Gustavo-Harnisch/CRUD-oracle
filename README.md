# UCM_DB

![Status](https://img.shields.io/badge/status-En%20desarrollo-yellow)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Node.js-339933?logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/database-Oracle-F80000?logo=oracle&logoColor=white)
![API](https://img.shields.io/badge/API-REST-blue)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

Proyecto práctico que implementa un CRUD con **React (Vite)** en el frontend y **Node/Express + Oracle** en el backend. La API usa tokens HMAC (`APP_KEY`) y se conecta a Oracle vía `node-oracledb`. El objetivo es cubrir usuarios/roles y extender al resto del dominio (empleados, productos, ventas, reservas, pagos, stock, etc.).

---

## 🧠 En este proyecto
- **React** gestiona la UI.
- **Node/Express** expone la API REST.
- **Oracle XE** almacena los datos (script SQL incluido).
- Autenticación con tokens firmados (HMAC) y roles.

---

## 🧱 Stack Tecnológico

### Frontend
- React + Vite
- Fetch/Axios para consumo de API
- CSS utilitario (ajustable a Tailwind/Bootstrap)

### Backend
- Node 18+, Express
- `node-oracledb` para Oracle
- CORS configurable, JSON parsing, rutas REST

### Base de Datos
- Oracle XE (o Standard/Enterprise)
- Cliente Oracle: Instant Client (requerido por `node-oracledb`)
- `COD_USUARIO` usa RUT chileno sin dígito verificador ni puntos (ej. 12.345.678-0 -> 12345678), sin secuencia/trigger de autoincremento.

---

## 🔧 Requisitos Previos
- Node.js 18+
- Docker con Oracle XE (`oracle-xe` sugerido, imagen `gvenzl/oracle-xe`)
- Oracle Instant Client (si ves `DPI-1047`, instálalo y exporta `LD_LIBRARY_PATH`)

---

## 📂 Estructura del Proyecto
```bash
.
├── db/
│   ├── Base_de_datos.sql        # Esquema Oracle
│   └── conexion.txt             # Datos de conexión de referencia
├── backend/
│   ├── src/
│   │   ├── routes/              # Rutas REST (auth, users, roles, admin requests)
│   │   ├── services/            # Lógica de dominio y acceso a datos
│   │   ├── utils/               # Errores, validaciones
│   │   ├── config.js            # Configuración (lee .env)
│   │   └── index.js             # Entrypoint Express
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/                     # Componentes/pages React
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Inicio rápido
```bash
# 1) Base de datos (si no existe el contenedor)
docker run -d --name oracle-xe -p 1521:1521 -p 5500:5500 -e ORACLE_PASSWORD=oracle gvenzl/oracle-xe

# 2) Levanta el contenedor
docker start oracle-xe

# 3) Carga el esquema (primera vez)
cat db/Base_de_datos.sql | docker exec -i oracle-xe sqlplus UCM/ucm@//localhost:1521/xepdb1

# 4) Backend
cd backend
cp .env.example .env   # ajusta APP_KEY y DB_*
npm install
npm run dev            # API en http://localhost:3000/api

# 5) Frontend
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
npm run dev -- --host --port 5173
```
Frontend en `http://localhost:5173`. Si cambiaste `PORT`, alinea `VITE_API_URL`.

---

## 🔑 Variables de entorno (backend)
- `APP_KEY`: clave HMAC para tokens.
- `DB_HOST`, `DB_PORT`, `DB_SERVICE`, `DB_USER`, `DB_PASSWORD`, `DB_CHARSET`
- `CORS_ORIGIN`: origen permitido (ej. `http://localhost:5173`).
- `ADMIN_ROLES`: lista separada por comas (ej. `ADMIN,ADMINISTRADOR`).
- `PORT`: puerto del servidor (por defecto 3000).

---

## 🔌 API actual
- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`
- Usuarios: `GET|POST /api/users`, `GET|PUT|DELETE /api/users/:id` (requiere admin)
- Roles: `GET|POST /api/roles`, `DELETE /api/roles/:id` (admin)
- Solicitudes admin: `POST /api/admin/requests`, `GET /api/admin/requests`, `POST /api/admin/requests/:id/(approve|reject)`
- Salud: `GET /api/ping`, `GET /api/test_oracle`

> Pendiente: implementar el resto del esquema (empleados, departamentos, productos, stock, ventas/pagos, habitaciones/reservas, etc.).

---

## 🧪 Credenciales de prueba
- Admin: `gustavo.admin@example.com` / `Gustavo_make_ALL2004.`
- Empleado: `gustavo.empleado@example.com` / `gustavo_empleado`
- Cliente: `gustavo.cliente@example.com` / `gustavo_cliente`

---

## 📜 Licencia
MIT.
