const router = require("express").Router();
const ctrl = require("../controllers/detallePagoHabitacionController");

router.get("/", ctrl.listarDetalles);
router.get("/:pagoId/:habId", ctrl.obtenerDetalle);
router.post("/", ctrl.crearDetalle);
router.put("/:pagoId/:habId", ctrl.actualizarDetalle);
router.delete("/:pagoId/:habId", ctrl.eliminarDetalle);

module.exports = router;
