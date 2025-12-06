const router = require("express").Router();
const ctrl = require("../controllers/movimientoStockController");

router.get("/", ctrl.listarMovimientos);
router.get("/:id", ctrl.obtenerMovimiento);
router.post("/", ctrl.crearMovimiento);
router.put("/:id", ctrl.actualizarMovimiento);
router.delete("/:id", ctrl.eliminarMovimiento);

module.exports = router;
