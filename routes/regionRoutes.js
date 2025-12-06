const router = require("express").Router();
const ctrl = require("../controllers/regionController");

router.get("/", ctrl.listarRegiones);
router.get("/:id", ctrl.obtenerRegion);
router.post("/", ctrl.crearRegion);
router.put("/:id", ctrl.actualizarRegion);
router.delete("/:id", ctrl.eliminarRegion);

module.exports = router;
