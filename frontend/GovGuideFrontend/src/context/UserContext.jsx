import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axiosClient from "../api/axiosClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const access = sessionStorage.getItem("access");

      if (!access) {
        setUser(null);
        return;
      }

      setLoading(true);
      const response = await axiosClient.get("/api/v1/auth/me");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
