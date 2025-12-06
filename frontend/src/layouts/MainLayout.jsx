// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageStatusBadge from "../components/PageStatusBadge";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 pt-4">
        {/* Cada página se encarga de usar container, rows, etc. */}
        <Outlet />
      </main>

      <PageStatusBadge />
      <Footer />
    </div>
  );
};

export default MainLayout;
