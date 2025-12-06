const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "devsecret";

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${header}.${body}`;
  const signature = crypto.createHmac("sha256", SECRET).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const unsigned = `${header}.${body}`;
  const expected = crypto.createHmac("sha256", SECRET).update(unsigned).digest("base64url");
  if (signature !== expected) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch (_) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ ok: false, message: "No autorizado" });
  }
  req.user = payload;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || !(req.user.rol === 1 || req.user.rol === "1" || req.user.rol === "admin")) {
    return res.status(403).json({ ok: false, message: "Requiere rol admin" });
  }
  next();
}

module.exports = {
  signToken,
  verifyToken,
  requireAuth,
  requireAdmin
};
