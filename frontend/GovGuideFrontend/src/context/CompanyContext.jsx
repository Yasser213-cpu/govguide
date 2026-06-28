import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { getCompanyId } from "../utils/auth";

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const companyId = getCompanyId();

      if (!companyId) {
        setCompany(null);
        return;
      }

      const { data } = await axiosClient.get(`/api/v1/companies/${companyId}`);

      setCompany(data);
    } catch (error) {
      console.error("Failed to load company:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        company,
        setCompany,
        loading,
        refreshCompany: fetchCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
