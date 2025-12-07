// Restored dashboard with status badges similar al comportamiento original.
import { Link, useLocation } from "react-router-dom";
import { PAGE_STATUS, getStatusClasses, resolvePageStatus } from "../../utils/pageStatus";

const adminPages = [
  { id: "home", title: "Inicio admin", description: "Hero y accesos protegidos.", path: "/admin/home" },
  { id: "dashboard", title: "Dashboard", description: "Resumen y enlaces rápidos.", path: "/admin" },
  { id: "inventory", title: "Inventario", description: "Productos, stock y umbrales.", path: "/admin/inventory" },
  { id: "rooms", title: "Habitaciones", description: "Catálogo, estado y precios base.", path: "/admin/rooms" },
  { id: "services", title: "Servicios", description: "Servicios y horarios.", path: "/admin/services" },
  { id: "users", title: "Usuarios", description: "Altas/bajas, roles y filtros.", path: "/admin/users" },
  { id: "employees", title: "Empleados", description: "Equipo interno y accesos.", path: "/admin/employees" },
  { id: "departments", title: "Departamentos", description: "Áreas, presupuestos y responsables.", path: "/admin/departments" },
  { id: "distributors", title: "Proveedores", description: "Distribuidores y solicitudes de compra.", path: "/admin/distributors" },
];

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const pagesWithStatus = adminPages.map((page) => ({
    ...page,
    status: resolvePageStatus(page.path),
    active: pathname === page.path,
  }));
  const quickIds = ["inventory", "rooms", "services", "users"];
  const quickLinks = pagesWithStatus.filter((p) => quickIds.includes(p.id));
  const otherLinks = pagesWithStatus.filter((p) => !quickIds.includes(p.id));
  const liveCount = pagesWithStatus.filter((p) => p.status === PAGE_STATUS.LIVE).length;
  const editingCount = pagesWithStatus.filter((p) => p.status === PAGE_STATUS.EDITING).length;

  return (
    <div className="container-xxl py-4">
      <div className="bg-white border rounded-4 shadow-sm p-4 p-lg-5 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <p className="text-uppercase text-muted mb-1 small">Administración</p>
            <h1 className="h3 mb-2">Panel de administración</h1>
            <p className="text-muted mb-0">Estado de las páginas y accesos rápidos al rol ADMIN.</p>
          </div>
          <div className="d-flex flex-wrap gap-3">
            <div className="px-3 py-2 border rounded-3 bg-light">
              <div className="fw-semibold fs-5">{pagesWithStatus.length}</div>
              <div className="text-muted small">Páginas ADMIN</div>
            </div>
            <div className="px-3 py-2 border rounded-3 bg-light">
              <div className="fw-semibold text-success">{liveCount}</div>
              <div className="text-muted small">LIVE</div>
            </div>
            <div className="px-3 py-2 border rounded-3 bg-light">
              <div className="fw-semibold text-warning">{editingCount}</div>
              <div className="text-muted small">EDITING</div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {pagesWithStatus.map((page) => (
            <div className="col-md-4" key={page.id}>
              <div className={`card h-100 shadow-sm ${page.active ? "border-primary" : ""}`}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{page.title}</h5>
                    <span className={`badge ${getStatusClasses(page.status)}`}>{page.status}</span>
                  </div>
                  <p className="card-text text-muted flex-grow-1">{page.description}</p>
                  <Link
                    to={page.path}
                    className={`btn btn-sm ${page.active ? "btn-primary" : "btn-outline-primary"} align-self-start`}
                  >
                    Ir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-muted small mb-1">Accesos rápidos</p>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {quickLinks.map((p) => (
              <Link key={p.id} to={p.path} className="btn btn-outline-secondary btn-sm">
                {p.title}
              </Link>
            ))}
          </div>
          <p className="text-muted small mb-1">Otros módulos</p>
          <div className="d-flex flex-wrap gap-2">
            {otherLinks.map((p) => (
              <Link key={p.id} to={p.path} className="btn btn-outline-secondary btn-sm">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
