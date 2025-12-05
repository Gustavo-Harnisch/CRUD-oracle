const { AppError } = require('./errors');

function requireNonEmpty(value, field) {
  if (String(value ?? '').trim() === '') {
    throw new AppError(`El campo ${field} es obligatorio`, 422);
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Correo electrónico inválido', 422);
  }
}

function validatePhone(phone) {
  if (!/^[0-9]{7,15}$/.test(phone)) {
    throw new AppError('Teléfono inválido, use solo dígitos (7-15)', 422);
  }
}

function validateRoles(roles) {
  if (!roles || roles.length === 0) {
    throw new AppError('Se requiere al menos un rol', 422);
  }
}

function normalizeRolesInput(input) {
  if (Array.isArray(input)) {
    return input;
  }
  if (typeof input === 'string' && input.trim() !== '') {
    return [input];
  }
  return [];
}

module.exports = {
  requireNonEmpty,
  validateEmail,
  validatePhone,
  validateRoles,
  normalizeRolesInput
};
