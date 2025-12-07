// Utilidades para trabajar con OUT binds de Oracle que a veces llegan como
// arreglo (por RETURNING) o como valor plano (OUT param normal).
function firstOutValue(outBind) {
  if (Array.isArray(outBind)) {
    return outBind[0];
  }
  return outBind;
}

module.exports = {
  firstOutValue
};
