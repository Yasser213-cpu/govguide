import axiosClient from "../../../api/axiosClient";

export const getChatHistory = async (url) => {
  const endpoint = url || "/api/v1/ai/chat-history/";
  const response = await axiosClient.get(endpoint);
  return response.data;
};

export const sendChatMessage = async (message) => {
  const response = await axiosClient.post("/api/v1/ai/chat/", { message });
  return response.data;
};
