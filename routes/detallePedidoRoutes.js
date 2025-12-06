const router = require("express").Router();
const ctrl = require("../controllers/detallePedidoController");

router.get("/", ctrl.listarDetalles);
router.get("/:pedidoId/:productoId", ctrl.obtenerDetalle);
router.post("/", ctrl.crearDetalle);
router.put("/:pedidoId/:productoId", ctrl.actualizarDetalle);
router.delete("/:pedidoId/:productoId", ctrl.eliminarDetalle);

module.exports = router;
