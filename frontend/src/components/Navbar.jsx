// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Inicio", end: true },
  { to: "/rooms", label: "Habitaciones", requiresAuth: true },
  { to: "/services", label: "Servicios" },
  { to: "/residencial-del-maule", label: "Residencial" },
  { to: "/contact", label: "Contacto" },
];

const adminLinks = [
  { to: "/admin", label: "Movimientos" },
  { to: "/admin/empleados", label: "Empleados" },
  { to: "/admin/habitaciones", label: "Habitaciones" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/ubicaciones", label: "Ubicaciones" },
  { to: "/admin/roles", label: "Roles" },
  { to: "/admin/users", label: "Usuarios" },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? " active fw-semibold text-dark" : ""}`;

  const displayName =
    user?.NOMBRE_USUARIO ||
    user?.name ||
    user?.nombre ||
    user?.fullName ||
    user?.username ||
    "Usuario";
  const displayEmail = user?.EMAIL_USUARIO || user?.email || user?.correo || "";
  const numericRole =
    (typeof user?.COD_ROL === "number" && user.COD_ROL) ||
    (typeof user?.role === "number" && user.role) ||
    (typeof user?.rol === "number" && user.rol) ||
    null;

  const numericRoleName = (value) => {
    if (!value && value !== 0) return null;
    const map = { 1: "Admin", 2: "Cliente", 5: "Empleado" };
    if (map[value]) return map[value];
    return `Rol ${value}`;
  };

  const roleLabel =
    user?.NOMBRE_ROL ||
    (typeof user?.role === "string" ? user.role : null) ||
    (typeof user?.rol === "string" ? user.rol : null) ||
    (typeof user?.ROL === "string" ? user.ROL : null) ||
    numericRoleName(numericRole) ||
    "Sin rol";

  const getInitials = (text) => {
    if (!text) return "U";
    const letters = text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    if (letters) return letters;
    return "U";
  };

  const userInitials = getInitials(displayName || displayEmail);

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
            {navLinks
              .filter((link) => !link.requiresAuth || isAuthenticated)
              .map(({ to, label, end }) => (
                <li className="nav-item" key={to}>
                  <NavLink to={to} end={end} className={linkClass}>
                    {label}
                  </NavLink>
                </li>
              ))}

            {isAuthenticated ? (
              <>
                {(user?.role === "admin" || user?.COD_ROL === 1 || user?.rol === 1) && (
                  <li className="nav-item dropdown">
                    <button
                      className="nav-link dropdown-toggle btn btn-link text-decoration-none"
                      id="adminMenu"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Panel
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenu">
                      {adminLinks.map((link) => (
                        <li key={link.to}>
                          <NavLink className="dropdown-item" to={link.to} end={link.to === "/admin"}>
                            {link.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-light btn-sm d-flex align-items-center gap-2 border dropdown-toggle ms-md-2"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                    title="Información del usuario"
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-semibold"
                      style={{ width: 34, height: 34, fontSize: "0.85rem" }}
                    >
                      {userInitials}
                    </span>
                    <span className="d-none d-lg-inline text-truncate" style={{ maxWidth: "10rem" }}>
                      {displayName}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenu">
                    <li className="px-3 py-2">
                      <div className="fw-semibold">{displayName}</div>
                      {displayEmail ? <div className="text-muted small">{displayEmail}</div> : null}
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li className="px-3 py-2 small text-muted">
                      <div className="d-flex justify-content-between">
                        <span>Rol</span>
                        <span className="text-dark fw-semibold">{roleLabel}</span>
                      </div>
                    </li>
                  </ul>
                </li>
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
                    `nav-link fw-semibold${isActive ? " text-dark" : ""}`
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
