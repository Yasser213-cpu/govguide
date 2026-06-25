import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CompanyRoute from "./components/CompanyRoute";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Home from "./pages/Home";
import CreateCompany from "./pages/company/CreateCompany";
import CompaniesList from "./pages/company/CompaniesList";
import AiChat from "./features/ai-chat/pages/AiChat"
import AppLayout from "./components/layout/AppLayout";
import PlaceholderPage from "./pages/app/PlaceholderPage";
import { navItems } from "./components/layout/navConfig";

// Company Imports
import CompanyAppLayout from "./components/layout/CompanyAppLayout";
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyServices from "./pages/company/Services";
import CompanyBookings from "./pages/company/Bookings";
import CompanySettings from "./pages/company/Settings";
import CompanyNotifications from "./pages/company/Notification";
import CompanyProfile from "./pages/company/Profile";

// Admin Imports
import AdminAppLayout from "./components/layout/AdminAppLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCompanies from "./pages/admin/Companies";
import AdminReports from "./pages/admin/Reports";

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
          {/* User Routes */}
          <Route element={<AppLayout />}>
            {navItems.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<PlaceholderPage pageKey={item.key} />}
              />
            ))}
          </Route>

          {/* Company Routes - Public for Testing */}
          <Route element={<CompanyAppLayout />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/services" element={<CompanyServices />} />
            <Route path="/company/bookings" element={<CompanyBookings />} />
            <Route path="/company/settings" element={<CompanySettings />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route
              path="/company/notifications"
              element={<CompanyNotifications />}
            />
          </Route>

          {/* Admin Routes - Public for Testing */}
          <Route element={<AdminAppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
