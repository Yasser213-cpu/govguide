import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function CompanyProtectedRoute() {
  const { initialized, isAuthenticated, user } = useAuth();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "company") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}