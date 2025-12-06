import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageStatusBadge from "../components/PageStatusBadge";

const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Si prefieres otro navbar para admin, luego lo cambias */}
      <Navbar />

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <PageStatusBadge />
    </div>
  );
};

export default AdminLayout;
