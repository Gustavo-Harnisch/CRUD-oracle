const oracledb = require("oracledb");

// Los resultados vendrán como objetos { COLUMNA: valor }
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Cambia user/password/connectString según tu Oracle
async function initPool() {
  await oracledb.createPool({
    user: "UCM",
    password: "ucm",
    connectString: "127.0.0.1:1521/XEPDB1" // o XE si tu servicio se llama así
  });
  console.log("✅ Pool de conexiones Oracle creado");
}

async function closePool() {
  await oracledb.getPool().close(0);
  console.log("🛑 Pool Oracle cerrado");
}

async function getConnection() {
  return await oracledb.getConnection();
}

module.exports = {
  oracledb,
  initPool,
  closePool,
  getConnection
};
