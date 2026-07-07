import axiosClient from "../../../api/axiosClient";

export const getCompanyInsights = async (procedureId) => {
  const { data } = await axiosClient.get(`/api/v1/ai/company-insights/${procedureId}`);
  return data;
};