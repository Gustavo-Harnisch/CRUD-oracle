const router = require("express").Router();
const ctrl = require("../controllers/usuarioRolController");

router.get("/", ctrl.listarUsuarioRoles);
router.get("/:usuarioId/:rolId", ctrl.obtenerUsuarioRol);
router.post("/", ctrl.crearUsuarioRol);
router.delete("/:usuarioId/:rolId", ctrl.eliminarUsuarioRol);

module.exports = router;
