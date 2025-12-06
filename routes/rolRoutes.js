const router = require("express").Router();
const ctrl = require("../controllers/rolController");

router.get("/", ctrl.listarRoles);
router.get("/:id", ctrl.obtenerRol);
router.post("/", ctrl.crearRol);
router.put("/:id", ctrl.actualizarRol);
router.delete("/:id", ctrl.eliminarRol);

module.exports = router;
