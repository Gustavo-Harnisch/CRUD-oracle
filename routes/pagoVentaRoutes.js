const router = require("express").Router();
const ctrl = require("../controllers/pagoVentaController");

router.get("/", ctrl.listarPagos);
router.get("/:id", ctrl.obtenerPago);
router.post("/", ctrl.crearPago);
router.put("/:id", ctrl.actualizarPago);
router.delete("/:id", ctrl.eliminarPago);

module.exports = router;
