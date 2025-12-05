// src/components/Navbar.jsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_VARIANTS = {
  UNLOGGED: [
    { to: "/", label: "Inicio", end: true },
    { to: "/rooms", label: "Habitaciones" },
    { to: "/services", label: "Servicios" },
    { to: "/residencial-del-maule", label: "Residencial" },
    { to: "/contact", label: "Contacto" },
  ],
  CUSTOMER: [
    { to: "/customer", label: "Mis reservas", end: true },
    { to: "/rooms", label: "Reservar" },
    { to: "/services", label: "Ofertas y experiencias" },
    { to: "/residencial-del-maule", label: "Noticias y panoramas" },
    { to: "/customer#perfil", label: "Editar perfil" },
    { to: "/contact", label: "Soporte" },
  ],
  EMPLOYEE: [
    { to: "/employee", label: "Panel diario", end: true },
    { to: "/rooms", label: "Habitaciones y tarifas" },
    { to: "/employee#agenda", label: "Crear evento" },
    { to: "/employee#clientes", label: "Clientes y check-in" },
    { to: "/employee#peticiones", label: "Peticiones de huéspedes" },
    { to: "/contact", label: "Comunicaciones" },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin#inventario", label: "Cuartos e inventario" },
    { to: "/admin/users", label: "Usuarios" },
    { to: "/admin/users#empleados", label: "Empleados" },
    { to: "/admin#tarifas", label: "Tarifas y promos" },
    { to: "/admin#auditoria", label: "Auditoría y logs" },
  ],
};

const resolveNavVariant = (roles = [], isAuthenticated) => {
  if (!isAuthenticated) return "UNLOGGED";
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("EMPLOYEE")) return "EMPLOYEE";
  if (roles.includes("USER")) return "CUSTOMER";
  return "UNLOGGED";
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isItemActive = (to, end = false) => {
    const parsed = new URL(to, "http://dummy");
    const targetPath = parsed.pathname;
    const targetHash = parsed.hash;

    if (end) {
      if (location.pathname !== targetPath) return false;
      return targetHash ? location.hash === targetHash : true;
    }

    if (!location.pathname.startsWith(targetPath)) return false;
    return targetHash ? location.hash === targetHash : true;
  };

  const linkClass = (to, end) =>
    `nav-link${isItemActive(to, end) ? " active fw-semibold" : ""}`;

  const roles = Array.isArray(user?.roles)
    ? user.roles.map((r) => String(r).toUpperCase())
    : user?.role
      ? [String(user.role).toUpperCase()]
      : [];
  const navVariant = resolveNavVariant(roles, isAuthenticated);
  const navItems = NAV_VARIANTS[navVariant] || NAV_VARIANTS.UNLOGGED;

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm fixed-top">
      <div className="container py-2">
        <NavLink className="navbar-brand fw-semibold" to="/">
          Residencial Maule
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-md-center gap-md-3">
            {navItems.map(({ to, label, end }) => (
              <li className="nav-item" key={to}>
                <NavLink to={to} end={end} className={() => linkClass(to, end)}>
                  {label}
                </NavLink>
              </li>
            ))}

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm ms-md-2"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `nav-link fw-semibold${isActive ? " active" : ""}`
                  }
                >
                  Iniciar sesión
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
