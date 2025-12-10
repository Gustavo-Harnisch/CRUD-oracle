import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listTeam, listDirectory } from "../../services/employeeService";

const statusBadge = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("turno")) return "badge bg-info-subtle text-info border";
  if (normalized.includes("activo")) return "badge bg-success-subtle text-success border";
  return "badge bg-light text-secondary border";
};

const EmployeeDepartment = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [dirSearch, setDirSearch] = useState("");
  const [error, setError] = useState("");

  const departmentName = user?.department || user?.departamento || "N/D";

  const greeting = useMemo(() => user?.name || "Colaborador", [user?.name]);

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const [teamData, dirData] = await Promise.all([listTeam(), listDirectory()]);
        const normalizedTeam = (teamData || []).map((emp) => ({
          name: emp.nombre || emp.name,
          role: emp.cargo || emp.rol || "N/D",
          shift: emp.turno || emp.shift || "N/D",
          focus: emp.enfoque || emp.focus || "",
          contact: emp.email || emp.contact || "N/D",
          status: emp.estadoLaboral || emp.status || "N/D",
        }));
        setTeam(Array.isArray(normalizedTeam) ? normalizedTeam : []);
        setDirectory(Array.isArray(dirData) ? dirData : []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos de tu equipo.");
        setTeam([]);
        setDirectory([]);
      }
    };
    load();
  }, []);

  const filteredDirectory = useMemo(() => {
    const term = dirSearch.trim().toLowerCase();
    return (directory || []).filter((emp) => {
      if (!term) return true;
      return (
        emp.nombre?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        String(emp.id || emp.usuarioId || "").includes(term)
      );
    });
  }, [directory, dirSearch]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <p className="text-uppercase text-muted mb-1 small">Empleado</p>
          <h1 className="h4 mb-1">Mi departamento</h1>
          <p className="text-muted small mb-0">
            {greeting}, aquí tienes datos rápidos de tu equipo y responsabilidades.
          </p>
        </div>
        <div className="text-md-end mt-3 mt-md-0">
          <p className="text-muted small mb-1">Departamento</p>
          <span className="badge bg-primary-subtle text-primary border">{departmentName}</span>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Equipo</h2>
              <p className="text-muted small mb-0">Roles, turnos y focos por persona.</p>
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
              Actualizar datos
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Turno</th>
                  <th>Enfoque</th>
                  <th>Contacto</th>
                  <th className="text-end">Estado</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={`${member.name}-${member.email || member.contact}`}>
                    <td className="fw-semibold">{member.name}</td>
                    <td>{member.role}</td>
                    <td>{member.shift}</td>
                    <td className="text-muted small">{member.focus}</td>
                    <td className="text-muted small">{member.contact}</td>
                    <td className="text-end">
                      <span className={statusBadge(member.status || "activo")}>{member.status || "Activo"}</span>
                    </td>
                  </tr>
                ))}
                {!team.length && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      Aún no hay integrantes para mostrar en tu departamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {error && <p className="text-danger small mt-3 mb-0">{error}</p>}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="h6 mb-1">Directorio de empleados</h2>
              <p className="text-muted small mb-0">Búsqueda global de empleados (todos los departamentos).</p>
            </div>
            <div className="d-flex gap-2">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Buscar por nombre, correo o ID"
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
              />
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setDirSearch("")}>
                Limpiar
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Departamento</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredDirectory.map((emp) => (
                  <tr key={`${emp.id || emp.usuarioId}-${emp.email}`}>
                    <td>{emp.id || emp.usuarioId}</td>
                    <td className="fw-semibold">{emp.nombre}</td>
                    <td className="text-muted small">{emp.email || "N/D"}</td>
                    <td>{emp.departamento || emp.departamentoNombre || emp.departamentoId || "N/D"}</td>
                    <td>{emp.cargo || "N/D"}</td>
                    <td>
                      <span className={statusBadge(emp.estadoLaboral || "activo")}>{emp.estadoLaboral || "Activo"}</span>
                    </td>
                  </tr>
                ))}
                {filteredDirectory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      Sin resultados para tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDepartment;
