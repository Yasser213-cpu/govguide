import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  getChatHistory,
  sendChatMessage as sendChatMessageApi,
} from "../api/chatHistoryApi";
import { getProcedureById } from "../api/Procedureapi";
import { recommendCompanies } from "../api/Recommendationapi";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const welcomeMessage = {
  id: "welcome",
  sender: "assistant",
  text: "Hello! 👋\n\nI'm GovGuide AI Assistant.\nAsk me anything about passports, national ID, driving licenses, company registration, or any government service.",
};

const buildMessagesFromHistory = (item) => [
  {
    id: `${item.id}-user`,
    sender: "user",
    text: item.message,
  },
  {
    id: `${item.id}-assistant`,
    sender: "assistant",
    text: item.answer,
    intent: item.intent,
    tokens: item.tokens_used,
  },
];

const getErrorMessage = (error) => {
  if (error.response?.status === 503) {
    return "AI service is temporarily unavailable. Please try again.";
  }
  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }
  return "Sorry, something went wrong. Please try again in a moment.";
};

export const useAiChat = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyNext, setHistoryNext] = useState(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

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

  const attachProcedureExtras = async (messageId, procedureId) => {
    try {
      const procedure = await getProcedureById(procedureId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, procedure } : message,
        ),
      );

      const recommendations = await recommendCompanies(procedureId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? { ...message, companies: recommendations.results }
            : message,
        ),
      );
    } catch (error) {
      // Do not surface checklist/recommendation fetch errors inside chat flow.
    }
  };

  const selectHistoryItem = (historyId) => {
    const item = history.find((entry) => entry.id === historyId);
    if (!item) return;
    setActiveHistoryId(historyId);
    setMessages(buildMessagesFromHistory(item));
  };

  const loadHistory = async (nextUrl) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const data = await getChatHistory(nextUrl);
      setHistory((prev) =>
        nextUrl ? [...prev, ...data.results] : data.results,
      );
      setHistoryNext(data.next);
      setHasMoreHistory(Boolean(data.next));
    } catch (error) {
      const message =
        error.response?.status === 401
          ? "Unauthorized. Please sign in again."
          : error.response?.status === 503
            ? "Chat history service is unavailable. Try again later."
            : "Unable to load chat history. Please try again.";
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setHistory([]);
      setActiveHistoryId(null);
      setHistoryError(null);
      setHistoryNext(null);
      setHasMoreHistory(false);
      setMessages([welcomeMessage]);
      return;
    }

    loadHistory();
  }, [isAuthenticated]);

  useEffect(() => {
    if (history.length === 0) return;
    if (!activeHistoryId) {
      selectHistoryItem(history[0].id);
    }
  }, [history, activeHistoryId]);

  const handleLoadMoreHistory = () => {
    if (!historyNext) return;
    loadHistory(historyNext);
  };

  const sendUserMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text,
    };

    setMessages([userMessage]);
    setLoading(true);

    try {
      const data = await sendChatMessageApi(text);

      const responseMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        text: "",
        typing: true,
        fullText: data.answer || "Sorry, I couldn't generate a response.",
        intent: data.intent,
      };

      setMessages([userMessage, responseMessage]);
      await typeAssistantReply(responseMessage.id, responseMessage.fullText);

      if (data.intent === "procedure_query" && data.procedure_id) {
        attachProcedureExtras(responseMessage.id, data.procedure_id);
      }

      if (isAuthenticated) {
        const historyItem = {
          id: Date.now(),
          message: text,
          answer: data.answer || "",
          intent: data.intent,
          tokens_used: data.tokens,
          created_at: new Date().toISOString(),
        };

        setHistory((prev) => [historyItem, ...prev]);
        setActiveHistoryId(historyItem.id);
      } else {
        setActiveHistoryId(null);
      }
    } catch (error) {
      const errorText = getErrorMessage(error);
      const errorMessage = {
        id: Date.now() + 2,
        sender: "assistant",
        text: errorText,
      };
      setMessages([userMessage, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    history,
    activeHistoryId,
    historyLoading,
    historyError,
    hasMoreHistory,
    selectHistoryItem,
    handleLoadMoreHistory,
    sendUserMessage,
  };
};
