// src/components/Navbar.jsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_VARIANTS = {
  UNLOGGED: [
    { to: "/", label: "Inicio", end: true },
    { to: "/rooms", label: "Habitaciones" },
    { to: "/services", label: "Servicios y experiencias" },
    { to: "/contact", label: "Contacto" },
  ],
  CUSTOMER: [
    { to: "/customer/bookings", label: "Mis reservas", end: true },
    { to: "/customer/reservations", label: "Nueva reserva" },
    { to: "/customer/booking-events", label: "Eventos de reserva" },
    { to: "/rooms", label: "Habitaciones" },
    { to: "/services", label: "Servicios y experiencias" },
    { to: "/customer/profile", label: "Perfil" },
    { to: "/contact", label: "Soporte" },
  ],
  EMPLOYEE: [
    { to: "/employee/home", label: "Inicio", end: true },
    { to: "/employee", label: "Panel diario" },
    { to: "/employee/agenda", label: "Agenda y eventos" },
    { to: "/employee/clients", label: "Clientes y check-in" },
    { to: "/employee/requests", label: "Peticiones de huéspedes" },
    { to: "/rooms", label: "Habitaciones y tarifas" },
    { to: "/contact", label: "Comunicaciones" },
  ],
  ADMIN: [
    { to: "/admin/home", label: "Inicio", end: true },
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/inventory", label: "Inventario" },
    { to: "/admin/rooms", label: "Habitaciones" },
    { to: "/admin/experiences", label: "Experiencias" },
    { to: "/admin/users", label: "Usuarios" },
    { to: "/admin/employees", label: "Empleados" },
    { to: "/admin/rates", label: "Tarifas y promos" },
    { to: "/admin/audit", label: "Auditoría y logs" },
    { to: "/admin/requests", label: "Solicitudes" },
  ],
};

const resolveNavVariant = (roles = [], isAuthenticated) => {
  if (!isAuthenticated) return "UNLOGGED";
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("EMPLOYEE")) return "EMPLOYEE";
  if (roles.includes("USER")) return "CUSTOMER";
  return "UNLOGGED";
};

const resolveHomePath = (roles = [], isAuthenticated) => {
  if (!isAuthenticated) return "/";
  if (roles.includes("ADMIN")) return "/admin/home";
  if (roles.includes("EMPLOYEE")) return "/employee/home";
  if (roles.includes("USER")) return "/customer/home";
  return "/";
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
  const homePath = resolveHomePath(roles, isAuthenticated);
  const primaryItems = navItems.slice(0, 4);
  const extraItems = navItems.slice(4);

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm fixed-top">
      <div className="container py-2">
        <NavLink className="navbar-brand fw-semibold" to={homePath}>
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
            {primaryItems.map(({ to, label, end }) => (
              <li className="nav-item" key={to}>
                <NavLink to={to} end={end} className={() => linkClass(to, end)}>
                  {label}
                </NavLink>
              </li>
            ))}

            {extraItems.length > 0 && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link"
                  id="moreMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  type="button"
                >
                  Más
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="moreMenu">
                  {extraItems.map(({ to, label, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        className={() =>
                          `dropdown-item${isItemActive(to, end) ? " active fw-semibold" : ""}`
                        }
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            )}

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
