const router = require("express").Router();
const ctrl = require("../controllers/reservaController");

router.get("/", ctrl.listarReservas);
router.get("/:id", ctrl.obtenerReserva);
router.post("/", ctrl.crearReserva);
router.post("/:id/pagar", ctrl.pagarReserva);
router.patch("/:id/fechas", ctrl.actualizarFechas);
router.put("/:id", ctrl.actualizarReserva);
router.delete("/:id", ctrl.eliminarReserva);

module.exports = router;
