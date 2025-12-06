const router = require("express").Router();
const ctrl = require("../controllers/calleController");

router.get("/", ctrl.listarCalles);
router.get("/:id", ctrl.obtenerCalle);
router.post("/", ctrl.crearCalle);
router.put("/:id", ctrl.actualizarCalle);
router.delete("/:id", ctrl.eliminarCalle);

module.exports = router;
