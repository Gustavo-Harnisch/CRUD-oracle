const router = require("express").Router();
const ctrl = require("../controllers/empleadoController");

router.get("/", ctrl.listarEmpleados);
router.get("/:id", ctrl.obtenerEmpleado);
router.post("/", ctrl.crearEmpleado);
router.put("/:id", ctrl.actualizarEmpleado);
router.delete("/:id", ctrl.eliminarEmpleado);

module.exports = router;

