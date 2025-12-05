import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Si prefieres otro navbar para admin, luego lo cambias */}
      <Navbar />

      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
