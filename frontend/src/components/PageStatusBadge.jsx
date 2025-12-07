// src/components/PageStatusBadge.jsx
import { useLocation } from "react-router-dom";
import { getStatusClasses, resolvePageStatus } from "../utils/pageStatus";

const PageStatusBadge = () => {
  const { pathname } = useLocation();
  const status = resolvePageStatus(pathname);

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
        className={`badge rounded-pill px-3 py-2 ${getStatusClasses(status)}`}
      >
        {status}
      </span>
    </div>
  );
};

export default PageStatusBadge;
