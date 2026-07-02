import axiosClient from "./axiosClient";

export const getCompanyDashboard = () => {
  return axiosClient.get("/api/v1/company/dashboard");
};
