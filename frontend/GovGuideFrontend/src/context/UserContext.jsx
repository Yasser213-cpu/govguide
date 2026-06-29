import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const access = sessionStorage.getItem("access");

        if (!access) return;

        const response = await axiosClient.get("/api/v1/auth/me");

        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
