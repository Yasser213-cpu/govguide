import axiosClient from "../../../api/axiosClient";

export const sendMessage = async (message) => {
  const response = await axiosClient.post("/api/v1/ai/chat/", {
    message,
  });

  return response.data;
};