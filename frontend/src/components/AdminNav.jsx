import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Movimientos" },
  { to: "/admin/empleados", label: "Empleados" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/ubicaciones", label: "Ubicaciones" },
  { to: "/admin/roles", label: "Roles" },
  { to: "/admin/users", label: "Usuarios" },
];

const AdminNav = () => {
  return (
    <div className="bg-white border-bottom shadow-sm">
      <div className="container">
        <ul className="nav nav-pills small py-2 flex-wrap">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/admin"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : "text-secondary"}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminNav;
