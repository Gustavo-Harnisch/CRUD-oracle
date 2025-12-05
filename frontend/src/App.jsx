// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import HomePage from "./pages/public/HomePage";
import RoomsPage from "./pages/RoomsPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import ResidencialDelMaulePage from "./pages/ResidencialDelMaulePage";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Usuarios from "./pages/Usuarios";
import CrearUsuario from "./pages/CrearUsuario";
import EditarUsuario from "./pages/EditarUsuario";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/residencial-del-maule"
            element={<ResidencialDelMaulePage />}
          />
        </Route>


        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rutas cliente (requiere login, rol USER/EMPLOYEE/ADMIN) */}
        <Route
          element={
            <ProtectedRoute roles={["USER", "EMPLOYEE", "ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/customer" element={<CustomerDashboard />} />
        </Route>

        {/* Rutas de empleado */}
        <Route
          element={
            <ProtectedRoute roles={["EMPLOYEE", "ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/employee" element={<EmployeeDashboard />} />
        </Route>

        {/* Rutas de administración */}
        <Route
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Usuarios />} />
          <Route path="/admin/users/create" element={<CrearUsuario />} />
          <Route path="/admin/users/:id/edit" element={<EditarUsuario />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
