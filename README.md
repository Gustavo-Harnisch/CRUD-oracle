# CRUD con React + PHP + Oracle

![Status](https://img.shields.io/badge/status-En%20desarrollo-yellow)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/backend-PHP-777BB4?logo=php&logoColor=white)
![Database](https://img.shields.io/badge/Database-Oracle-F80000?logo=oracle&logoColor=white)
![API](https://img.shields.io/badge/API-REST-blue)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

Proyecto práctico que implementa un **CRUD (Create, Read, Update, Delete)** usando **React** como frontend, **PHP** como backend y **Oracle Database** como motor de base de datos.  
PHP se comunica con Oracle mediante la extensión **OCI8** o **PDO_OCI**, exponiendo una API REST que luego es consumida por React.

---

## 🧠 En este proyecto:

- **React** gestiona la UI.
- **PHP** procesa las peticiones del frontend.
- **Oracle** almacena los datos y ejecuta las consultas SQL.

---

## 🧱 Stack Tecnológico

### **Frontend**
- React
- Fetch API o Axios
- HTML / CSS / Tailwind / Bootstrap

### **Backend**
- PHP 8+
- Extensión **OCI8** (recomendada) o **PDO_OCI**
- Servidor Apache / Nginx / Laragon / XAMPP

### **Base de Datos**
- Oracle Database (XE, Standard o Enterprise)
- Cliente Oracle: **Instant Client** (necesario para OCI8)

---

## 🔧 Requisitos Previos

- Node.js 18+
- PHP 8+
- Oracle Database (XE recomendado)
- Oracle Instant Client
- Servidor Apache o Nginx


## 📂 Estructura del Proyecto

```bash
.
├── backend/
│   ├── config/
│   │   └── db.php          # Conexión PHP → Oracle
│   ├── api/
│   │   └── users.php       # API CRUD en PHP
│   └── index.php           
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

