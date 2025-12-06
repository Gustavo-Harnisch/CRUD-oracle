const express = require("express");
const cors = require("cors");
const { initPool, closePool } = require("./db");

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const habitacionRoutes = require("./routes/habitacionRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const ventaRoutes = require("./routes/ventaRoutes");
const empleadoRoutes = require("./routes/empleadoRoutes");
const proveedorRoutes = require("./routes/proveedorRoutes");
const regionRoutes = require("./routes/regionRoutes");
const ciudadRoutes = require("./routes/ciudadRoutes");
const comunaRoutes = require("./routes/comunaRoutes");
const calleRoutes = require("./routes/calleRoutes");
const rolRoutes = require("./routes/rolRoutes");
const usuarioRolRoutes = require("./routes/usuarioRolRoutes");
const detallePagoHabRoutes = require("./routes/detallePagoHabitacionRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const detallePedidoRoutes = require("./routes/detallePedidoRoutes");
const detalleVentaRoutes = require("./routes/detalleVentaRoutes");
const movimientoStockRoutes = require("./routes/movimientoStockRoutes");
const pagoVentaRoutes = require("./routes/pagoVentaRoutes");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Node esta funcionando");
});

// Rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/habitaciones", habitacionRoutes); // GETs serán públicas; escrituras, protegidas en el router

// Middleware global de autenticación para el resto
app.use((req, res, next) => {
  // Permitir GET de habitaciones sin token
  if (req.method === "GET" && req.path.startsWith("/api/habitaciones")) {
    return next();
  }
  // Permitir login/register
  if (req.path.startsWith("/api/auth")) {
    return next();
  }
  return requireAuth(req, res, next);
});

// Rutas protegidas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/regiones", regionRoutes);
app.use("/api/ciudades", ciudadRoutes);
app.use("/api/comunas", comunaRoutes);
app.use("/api/calles", calleRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/usuario-roles", usuarioRolRoutes);
app.use("/api/detalle-pago-habitacion", detallePagoHabRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/detalle-pedidos", detallePedidoRoutes);
app.use("/api/detalle-ventas", detalleVentaRoutes);
app.use("/api/movimientos-stock", movimientoStockRoutes);
app.use("/api/pago-ventas", pagoVentaRoutes);

(async () => {
  try {
    await initPool();
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar el servidor:", err);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  try {
    await closePool();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
