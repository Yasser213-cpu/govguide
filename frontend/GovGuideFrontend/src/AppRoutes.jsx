import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CompanyRoute from "./components/CompanyRoute";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/home/Dashboard";
import Home from "./pages/Home";
import CreateCompany from "./pages/company/CreateCompany";
import CompaniesList from "./pages/company/CompaniesList";
import AiChat from "./features/ai-chat/pages/AiChat"

export default function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/ai-chat" element={<AiChat />} />


          {/* Public company browsing */}
          <Route path="/companies" element={<CompaniesList />} />

          {/* Company setup — only for company role with no company yet */}
          <Route
            path="/company/create"
            element={
              <CompanyRoute>
                <CreateCompany />
              </CompanyRoute>
            }
          />

          {/* Protected — any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
