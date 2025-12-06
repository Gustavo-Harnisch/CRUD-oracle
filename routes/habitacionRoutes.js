const router = require("express").Router();
const ctrl = require("../controllers/habitacionController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Público: ver habitaciones
router.get("/", ctrl.listarHabitaciones);
router.get("/:id", ctrl.obtenerHabitacion);

// Admin: ver ocupación y liberar
router.get("/admin/ocupacion/todas", requireAuth, requireAdmin, ctrl.listarOcupacion);
router.patch("/:id/liberar", requireAuth, requireAdmin, ctrl.liberarHabitacion);

// Solo autenticados pueden crear/editar/eliminar (p.ej. admin/empleado)
router.post("/", requireAuth, ctrl.crearHabitacion);
router.put("/:id", requireAuth, ctrl.actualizarHabitacion);
router.delete("/:id", requireAuth, ctrl.eliminarHabitacion);

module.exports = router;
