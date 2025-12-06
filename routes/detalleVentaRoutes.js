const router = require("express").Router();
const ctrl = require("../controllers/detalleVentaController");

router.get("/", ctrl.listarDetalles);
router.get("/:ventaId/:productoId", ctrl.obtenerDetalle);
router.post("/", ctrl.crearDetalle);
router.put("/:ventaId/:productoId", ctrl.actualizarDetalle);
router.delete("/:ventaId/:productoId", ctrl.eliminarDetalle);

module.exports = router;
