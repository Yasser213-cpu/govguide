import { createContext, useState, useCallback, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  const isAuthenticated = !!sessionStorage.getItem("access");

  const register = useCallback(
    async (first_name, last_name, username, email, role, password) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.post(
          "/api/v1/auth/register/client",
          {
            first_name,
            last_name,
            username,
            email,
            role,
            password,
          },
        );
        return response.data;
      } catch (err) {
        const data = err.response?.data;
        let message;
        if (data && typeof data === "object" && !data.detail) {
          message = Object.values(data).flat().join(" ");
        } else {
          message = data?.detail || err.message || "Registration failed";
        }
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const verifyOtp = useCallback(async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("api/v1/auth/verify", {
        email,
        otp,
      });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || "OTP verification failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      console.log();
      const response = await axiosClient.post("api/v1/auth/resend-otp", {
        email,
      });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || "Failed to resend OTP";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("api/v1/auth/token", {
        email,
        password,
      });
      const { access, refresh, role, next_step } = response.data;
      if (!access) throw new Error(response.data?.detail || "Login failed");

      sessionStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      const userData = { role, next_step };
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("pendingEmail", email);
      return response.data;
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || err.message || "Login failed";
      setError(message);
      const error = new Error(message);
      error.next_step = data?.next_step;
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("user");
    localStorage.removeItem("refresh");
    setUser(null);
    setError(null);
  }, []);

  const forgetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("api/v1/auth/forget-password", {
        email,
      });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        "Failed to send reset code";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("api/v1/auth/reset-password", {
        email,
        otp,
        password,
      });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || "Password reset failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // After company is created, update next_step so CompanyRoute stops blocking
  const markCompanyCreated = useCallback(() => {
    setUser((prev) => {
      const updated = { ...prev, next_step: "dashboard" };
      sessionStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    forgetPassword,
    resetPassword,
    markCompanyCreated,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
