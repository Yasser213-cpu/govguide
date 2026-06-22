import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Guards /company/create:
 * - Must be logged in
 * - Must have role "company"
 * - If next_step is not "create_company" (already set up), redirect to dashboard
 */
export default function CompanyRoute({ children }) {
  const { isAuthenticated, initialized, user } = useAuth();

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
    return <Navigate to="/dashboard" replace />;
  }

  // Company already created — skip setup
  if (user?.next_step && user.next_step !== "create_company") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}