function hasRole(user, roles) {
  if (!user || !Array.isArray(user.roles)) return false;
  const normalized = user.roles.map((r) => String(r || '').toUpperCase());
  return roles.some((r) => normalized.includes(String(r || '').toUpperCase()));
}

module.exports = {
  hasRole
};
