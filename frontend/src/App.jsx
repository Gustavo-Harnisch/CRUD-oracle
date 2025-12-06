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
import AdminDashboard from "./pages/AdminDashboard";
import Usuarios from "./pages/Usuarios";
import CrearUsuario from "./pages/CrearUsuario";
import EditarUsuario from "./pages/EditarUsuario";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminEmpleadosPage from "./pages/AdminEmpleadosPage";
import AdminHabitacionesPage from "./pages/AdminHabitacionesPage";
import AdminProductosPage from "./pages/AdminProductosPage";
import AdminPedidosPage from "./pages/AdminPedidosPage";
import AdminUbicacionesPage from "./pages/AdminUbicacionesPage";
import AdminRolesPage from "./pages/AdminRolesPage";

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

        {/* Rutas de administración */}
        <Route
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/empleados" element={<AdminEmpleadosPage />} />
          <Route path="/admin/habitaciones" element={<AdminHabitacionesPage />} />
          <Route path="/admin/productos" element={<AdminProductosPage />} />
          <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
          <Route path="/admin/ubicaciones" element={<AdminUbicacionesPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
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
