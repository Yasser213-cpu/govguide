import { useState } from "react";
import { sendMessage } from "../api/aiChatApi";
import { getProcedureById } from "../api/Procedureapi";
import { recommendCompanies } from "../api/Recommendationapi";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_GREETING = {
  id: 1,
  sender: "assistant",
  text: "Hello! 👋\n\nI'm GovGuide AI Assistant.\nAsk me anything about passports, national ID, driving licenses, company registration, or any government service.",
};

export const useAiChat = () => {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [sessionId, setSessionId] = useState(null);
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

  // Attach the checklist/fees + ranked companies to an already-rendered
  // assistant message once both calls resolve. Failures here are silent —
  // the chat answer itself already rendered, so we don't want a checklist
  // or recommendation error to look like the whole reply failed.
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
      // Checklist/recommendation fetch failed — leave the plain text answer
      // as-is rather than surfacing a second error bubble.
    }
  };

  const startNewConversation = () => {
    setSessionId(null);
    setMessages([INITIAL_GREETING]);
  };

  const loadConversation = (nextSessionId, sessionMessages) => {
    setSessionId(nextSessionId);

    const loadedMessages = sessionMessages.flatMap((exchange) => [
      {
        id: `user-${exchange.id}`,
        sender: "user",
        text: exchange.message,
      },
      {
        id: `assistant-${exchange.id}`,
        sender: "assistant",
        text: exchange.answer,
        intent: exchange.intent,
      },
    ]);

    setMessages(loadedMessages);
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
      const data = await sendMessage(text, sessionId);

      if (data.session_id) {
        setSessionId(data.session_id);
      }

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

      // Backend will eventually include `procedure_id` on procedure_query
      // responses. Only fetch the checklist/companies when it's present —
      // degrade to plain text otherwise.
      if (data.intent === "procedure_query" && data.procedure_id) {
        attachProcedureExtras(aiMessage.id, data.procedure_id);
      }
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
    sessionId,
    sendUserMessage,
    startNewConversation,
    loadConversation,
  };
};
