const router = require("express").Router();
const ctrl = require("../controllers/productoController");

router.get("/", ctrl.listarProductos);
router.get("/:id", ctrl.obtenerProducto);
router.post("/", ctrl.crearProducto);
router.put("/:id", ctrl.actualizarProducto);
router.delete("/:id", ctrl.eliminarProducto);

module.exports = router;
