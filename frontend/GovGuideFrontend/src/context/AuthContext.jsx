import { createContext, useState, useCallback, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);


  useEffect(() => {
      setInitialized(true);
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const register = useCallback(async (username,email, role, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("/v1/auth/register/client", {
        username,
        email,
        role,
        password
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Registration failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("/v1/auth/verify-otp", {
        phone,
        otp,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "OTP verification failed";
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
      const response = await axiosClient.post("/v1/auth/token", {
        email,
        password,
      });

      const { access, user: userData } = response.data;

      if (!access) {
        throw new Error(response.data?.detail || "Login failed");
      }

      setToken(access);
      if (userData) {
        setUser(userData);
      }

      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem("token");
  }, []);

  const resetPassword = useCallback(async (email, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.post("/v1/auth/reset-password", {
        email,
        new_password: newPassword,
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Password reset failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated: !!token,
    register,
    verifyOtp,
    login,
    logout,
    resetPassword,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
