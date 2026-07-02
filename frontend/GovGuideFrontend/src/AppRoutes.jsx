import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CompanyProvider } from "./context/CompanyContext";
import { UserProvider } from "./context/UserContext";
import { PageLoadingProvider } from "./context/PageLoadingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import CompanyRoute from "./components/CompanyRoute";
import CompanyProtectedRoute from "./components/CompanyProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Home from "./pages/Home";
import CreateCompany from "./pages/company/CreateCompany";
import CompaniesList from "./pages/user/CompaniesList";
import AiChat from "./pages/user/AiChat";
import AppLayout from "./components/layout/AppLayout";
import PlaceholderPage from "./pages/app/PlaceholderPage";
import { navItems } from "./components/layout/navConfig";
import Dashboard from "./pages/user/Dashboard";
import CompanyDetails from "./pages/user/CompanyDetails";
import MyRequests from "./pages/user/Myrequests";
import RequestDetails from "./pages/user/RequestDetails";

// Company Imports
import CompanyAppLayout from "./components/layout/CompanyAppLayout";
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyOrders from "./pages/company/CompanyOrders";
import CompanyOrderDetail from "./pages/company/CompanyOrderDetail";
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
        <UserProvider>
          <CompanyProvider>
            <PageLoadingProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/verify-otp"
                  element={
                    <GuestRoute>
                      <VerifyOtp />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPassword />
                    </GuestRoute>
                  }
                />

                <Route
                  path="/ai-chat"
                  element={<Navigate to="/user/ai-assistant" replace />}
                />

                {/* Public company browsing redirects to authenticated user view */}
                <Route
                  path="/companies"
                  element={<Navigate to="/user/companies" replace />}
                />

                {/* Company setup — only for company role with no company yet */}
                <Route
                  path="/company/create"
                  element={
                    <CompanyRoute>
                      <CreateCompany />
                    </CompanyRoute>
                  }
                />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/user/dashboard" element={<Dashboard />} />
                  <Route path="/user/ai-assistant" element={<AiChat />} />
                  <Route path="/user/companies" element={<CompaniesList />} />
                  <Route path="/user/my-requests" element={<MyRequests />} />
                  <Route
                    path="/user/my-requests/:id"
                    element={<RequestDetails />}
                  />

                  <Route
                    path="/user/companies/:id"
                    element={<CompanyDetails />}
                  />

                  {navItems
                    .filter(
                      (item) =>
                        ![
                          "/user/dashboard",
                          "/user/ai-assistant",
                          "/user/companies",
                          "/user/my-requests",
                        ].includes(item.path),
                    )
                    .map((item) => (
                      <Route
                        key={item.path}
                        path={item.path}
                        element={<PlaceholderPage pageKey={item.key} />}
                      />
                    ))}
                </Route>

                <Route element={<CompanyProtectedRoute />}>
                  <Route element={<CompanyAppLayout />}>
                    <Route
                      path="/company/dashboard"
                      element={<CompanyDashboard />}
                    />
                    <Route path="/company/orders" element={<CompanyOrders />} />
                    <Route
                      path="/company/orders/:id"
                      element={<CompanyOrderDetail />}
                    />
                    <Route
                      path="/company/services"
                      element={<CompanyServices />}
                    />
                    <Route
                      path="/company/bookings"
                      element={<CompanyBookings />}
                    />
                    <Route
                      path="/company/profile"
                      element={<CompanyProfile />}
                    />
                    <Route
                      path="/company/settings"
                      element={<CompanySettings />}
                    />
                    <Route
                      path="/company/notifications"
                      element={<CompanyNotifications />}
                    />
                  </Route>
                </Route>

                {/* Admin Routes - Public for Testing */}
                <Route element={<AdminProtectedRoute />}>
                  <Route element={<AdminAppLayout />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route
                      path="/admin/companies"
                      element={<AdminCompanies />}
                    />
                    <Route path="/admin/reports" element={<AdminReports />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageLoadingProvider>
          </CompanyProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}
