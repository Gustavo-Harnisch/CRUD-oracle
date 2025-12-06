const router = require("express").Router();
const ctrl = require("../controllers/ventaController");

router.get("/", ctrl.listarVentas);
router.get("/:id", ctrl.obtenerVenta);
router.post("/", ctrl.crearVenta);
router.post("/comprar", ctrl.crearVentaUsuario);
router.put("/:id", ctrl.actualizarVenta);
router.delete("/:id", ctrl.eliminarVenta);

module.exports = router;
