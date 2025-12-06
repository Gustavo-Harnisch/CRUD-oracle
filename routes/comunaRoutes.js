const router = require("express").Router();
const ctrl = require("../controllers/comunaController");

router.get("/", ctrl.listarComunas);
router.get("/:id", ctrl.obtenerComuna);
router.post("/", ctrl.crearComuna);
router.put("/:id", ctrl.actualizarComuna);
router.delete("/:id", ctrl.eliminarComuna);

module.exports = router;
