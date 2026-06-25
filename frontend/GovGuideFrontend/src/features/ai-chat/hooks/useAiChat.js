import { useState } from "react";
import { sendMessage } from "../api/aiChatApi";

export const useAiChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! How can I help you today?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendUserMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const data = await sendMessage(text);

      const aiMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        text: data.answer,
        intent: data.intent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        sender: "assistant",
        text:
          error.response?.status === 503
            ? "AI service is temporarily unavailable. Please try again."
            : "Something went wrong.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendUserMessage,
  };
};