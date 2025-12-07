// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import HomePage from "./pages/public/HomePage";
import RoomsPage from "./pages/RoomsPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerReservation from "./pages/customer/CustomerReservation";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerBookingEvents from "./pages/customer/CustomerBookingEvents";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import EmployeeClients from "./pages/employee/EmployeeClients";
import EmployeeRequests from "./pages/employee/EmployeeRequests";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminEmployees from "./pages/admin/AdminEmployees";
import EmployeeRooms from "./pages/employee/EmployeeRooms";
import EmployeeDepartment from "./pages/employee/EmployeeDepartment";
import EmployeeServices from "./pages/employee/EmployeeServices";
// Admin pages en uso
import CustomerHome from "./pages/customer/CustomerHome";
import EmployeeHome from "./pages/employee/EmployeeHome";
import AdminHome from "./pages/admin/AdminHome";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminServices from "./pages/admin/AdminServices";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminDistributors from "./pages/admin/AdminDistributors";

const resolveHomePath = (roles = []) => {
  const normalized = Array.isArray(roles) ? roles.map((r) => String(r).toUpperCase()) : [];
  if (normalized.includes("ADMIN")) return "/admin/home";
  if (normalized.includes("EMPLOYEE")) return "/employee/home";
  if (normalized.includes("USER")) return "/customer";
  return "/";
};

const HomeEntry = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={resolveHomePath(user?.roles)} replace />;
  }
  return <HomePage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeEntry />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/home" element={<Navigate to="/customer" replace />} />
          <Route path="/customer/bookings" element={<CustomerBookings />} />
          <Route path="/customer/booking-events" element={<CustomerBookingEvents />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/reservations" element={<CustomerReservation />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Route>

        {/* Rutas de empleado */}
        <Route
          element={
            <ProtectedRoute roles={["EMPLOYEE", "ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/employee/home" element={<EmployeeHome />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/clients" element={<EmployeeClients />} />
          <Route path="/employee/requests" element={<EmployeeRequests />} />
          <Route path="/employee/rooms" element={<EmployeeRooms />} />
          <Route path="/employee/services" element={<EmployeeServices />} />
          <Route path="/employee/department" element={<EmployeeDepartment />} />
        </Route>

        {/* Rutas de administración */}
        <Route
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/create" element={<CreateUser />} />
          <Route path="/admin/users/:id/edit" element={<EditUser />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
        </Route>

        {/* Rutas compartidas admin/empleado (usa layout admin por ahora) */}
        <Route
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/distributors" element={<AdminDistributors />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
