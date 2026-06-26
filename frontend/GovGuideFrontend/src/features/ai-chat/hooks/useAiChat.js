import { useState } from "react";
import { sendMessage } from "../api/aiChatApi";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAiChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! 👋\n\nI'm GovGuide AI Assistant.\nAsk me anything about passports, national ID, driving licenses, company registration, or any government service.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const typeAssistantReply = async (messageId, fullText) => {
    for (let index = 1; index <= fullText.length; index += 1) {
      await sleep(12);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: fullText.slice(0, index),
                typing: index < fullText.length,
              }
            : message,
        ),
      );
    }
  };

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
        text: "",
        typing: true,
        fullText: data.answer || "Sorry, I couldn't generate a response.",
        intent: data.intent,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await typeAssistantReply(aiMessage.id, data.answer);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        sender: "assistant",
        text:
          error.response?.status === 503
            ? "AI service is temporarily unavailable. Please try again."
            : "Sorry, something went wrong. Please try again in a moment.",
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
