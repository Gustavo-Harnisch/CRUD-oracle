const router = require("express").Router();
const ctrl = require("../controllers/pedidoController");

router.get("/", ctrl.listarPedidos);
router.get("/:id", ctrl.obtenerPedido);
router.post("/", ctrl.crearPedido);
router.put("/:id", ctrl.actualizarPedido);
router.delete("/:id", ctrl.eliminarPedido);

module.exports = router;
