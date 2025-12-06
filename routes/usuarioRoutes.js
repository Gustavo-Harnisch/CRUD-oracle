const router = require("express").Router();
const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require("../controllers/usuarioController");

// GET /api/usuarios
router.get("/", listarUsuarios);

// GET /api/usuarios/:id
router.get("/:id", obtenerUsuario);

// POST /api/usuarios
router.post("/", crearUsuario);

// PUT /api/usuarios/:id
router.put("/:id", actualizarUsuario);

// DELETE /api/usuarios/:id
router.delete("/:id", eliminarUsuario);

module.exports = router;
