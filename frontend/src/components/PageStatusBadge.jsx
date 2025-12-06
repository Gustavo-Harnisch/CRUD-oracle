// src/components/PageStatusBadge.jsx
import { useLocation } from "react-router-dom";

const STATUS_MAP = [
  { match: (path) => path.startsWith("/customer/profile"), label: "DEMO" },
  { match: (path) => path.startsWith("/admin/users"), label: "LANZADO" },
  { match: (path) => path.startsWith("/admin/rooms"), label: "LANZADO" },
  { match: (path) => path.startsWith("/admin/experiences"), label: "LANZADO" },
  { match: (path) => path.startsWith("/customer"), label: "LANZADO" },
  { match: (path) => path.startsWith("/rooms"), label: "LANZADO" },
  { match: (path) => path.startsWith("/services"), label: "LANZADO" },
  { match: (path) => path.startsWith("/login"), label: "LANZADO" },
];

const resolveStatus = (path) => {
  const found = STATUS_MAP.find((item) => item.match(path));
  return found ? found.label : "DEMO";
};

const PageStatusBadge = () => {
  const { pathname } = useLocation();
  const status = resolveStatus(pathname);
  const isLaunched = status === "LANZADO";

  return (
    <div
      className="position-fixed"
      style={{
        zIndex: 1031,
        bottom: "18px",
        right: "18px",
      }}
    >
      <span
        className={`badge rounded-pill border px-3 py-2 ${
          isLaunched ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
        }`}
      >
        {status}
      </span>
    </div>
  );
};

export default PageStatusBadge;
