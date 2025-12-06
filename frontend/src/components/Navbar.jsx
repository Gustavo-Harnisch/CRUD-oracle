// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Inicio", end: true },
  { to: "/rooms", label: "Habitaciones" },
  { to: "/services", label: "Servicios" },
  { to: "/residencial-del-maule", label: "Residencial" },
  { to: "/contact", label: "Contacto" },
];

const adminLinks = [
  { to: "/admin", label: "Movimientos" },
  { to: "/admin/empleados", label: "Empleados" },
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
            {navLinks.map(({ to, label, end }) => (
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
