const router = require("express").Router();
const ctrl = require("../controllers/ciudadController");

router.get("/", ctrl.listarCiudades);
router.get("/:id", ctrl.obtenerCiudad);
router.post("/", ctrl.crearCiudad);
router.put("/:id", ctrl.actualizarCiudad);
router.delete("/:id", ctrl.eliminarCiudad);

module.exports = router;
