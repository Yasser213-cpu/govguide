import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Guards /company/create:
 * - Must be logged in
 * - Must have role "company"
 * - If next_step is not "create_company" (already set up), redirect to dashboard
 */
export default function CompanyRoute({ children }) {
  const auth = useAuth();

  console.log("AUTH:", auth);

  const { isAuthenticated, initialized, user } = auth;

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("Redirect -> login");
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "company") {
    console.log("Redirect -> company dashboard (role)", user);
    return <Navigate to="/company/dashboard" replace />;
  }

  if (user?.next_step && user.next_step !== "create_company") {
    console.log("Redirect -> company dashboard (next_step)", user.next_step);
    return <Navigate to="/company/dashboard" replace />;
  }

  console.log("PASS");

  return children;
}
