import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAdminAuth from "./useAdminAuth.js";

export default function AdminRoute() {
  const { isAuthenticated, isCheckingAuth } = useAdminAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-eyebrow">Checking Session</p>
          <h1>Loading admin access...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
