import { Outlet } from "react-router-dom";
import PageStatusBadge from "../components/PageStatusBadge";

const AuthLayout = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Outlet />
      <PageStatusBadge />
    </div>
  );
};

export default AuthLayout;
