import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute({ children }) {
  const { isAuthenticated, initialized, user } = useAuth();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === "company") {
      return <Navigate to="/company/dashboard" replace />;
    }
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}
