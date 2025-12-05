// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-light">
      <Navbar />

      <main className="flex-grow-1 pt-4">
        {/* Cada página se encarga de usar container, rows, etc. */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
