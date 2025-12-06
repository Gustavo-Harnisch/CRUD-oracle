 const router = require("express").Router();
const ctrl = require("../controllers/proveedorController");

router.get("/", ctrl.listarProveedores);
router.get("/:id", ctrl.obtenerProveedor);
router.post("/", ctrl.crearProveedor);
router.put("/:id", ctrl.actualizarProveedor);
router.delete("/:id", ctrl.eliminarProveedor);

module.exports = router;
