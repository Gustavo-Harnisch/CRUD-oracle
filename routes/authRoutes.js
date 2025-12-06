const router = require("express").Router();
const { login, register } = require("../controllers/authController");

// POST /api/auth/login
router.post("/login", login);
// POST /api/auth/register
router.post("/register", register);

module.exports = router;
