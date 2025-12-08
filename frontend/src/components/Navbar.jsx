// src/components/Navbar.jsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_VARIANTS = {
  UNLOGGED: [
    { to: "/", label: "Inicio", end: true },
    { to: "/rooms", label: "Habitaciones" },
    { to: "/services", label: "Servicios y experiencias" },
  ],
  CUSTOMER: [
    { to: "/customer/dashboard", label: "Dashboard", end: true },
    { to: "/customer/bookings", label: "Mis reservas", end: true },
    { to: "/customer/reservations", label: "Nueva reserva" },
    { to: "/customer/booking-events", label: "Servicios de reserva" },
    { to: "/rooms", label: "Habitaciones" },
    { to: "/services", label: "Servicios y experiencias" },
    { to: "/customer/profile", label: "Perfil" }
  ],
  EMPLOYEE: [
    { to: "/employee/home", label: "Inicio", end: true },
    { to: "/employee", label: "Dashboard" },
    { to: "/employee/clients", label: "Check-in y clientes" },
    { to: "/employee/rooms", label: "Habitaciones (ops)" },
    { to: "/employee/services", label: "Servicios" },
    { to: "/employee/requests", label: "Peticiones de huéspedes" },
    { to: "/employee/department", label: "Mi departamento" },
    { to: "/admin/distributors", label: "Proveedores" }
  ],
  ADMIN: [
    { to: "/admin/home", label: "Inicio", end: true },
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/inventory", label: "Inventario" },
    { to: "/admin/rooms", label: "Habitaciones" },
    { to: "/admin/services", label: "Servicios" },
    { to: "/admin/packages", label: "Paquetes" },
    { to: "/admin/users", label: "Usuarios" },
    { to: "/admin/employees", label: "Empleados" },
    { to: "/admin/departments", label: "Departamentos" },
    { to: "/admin/distributors", label: "Proveedores" },
    { to: "/admin/reports", label: "Reportes" },
    // Auditoría/logs y solicitudes quedan fuera del menú hasta tener funcionalidad real.
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
    navigate("/", { replace: true });
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
