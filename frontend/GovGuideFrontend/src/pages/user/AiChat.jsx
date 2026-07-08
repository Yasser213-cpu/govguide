import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsBank2 } from "react-icons/bs";
import { FiClock } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import ChatMessage from "../../features/ai-chat/components/ChatMessage";
import ChatInput from "../../features/ai-chat/components/ChatInput";
import TypingIndicator from "../../features/ai-chat/components/TypingIndicator";
import ChatHistoryPanel from "../../features/ai-chat/components/ChatHistoryPanel";
import { useAiChat } from "../../features/ai-chat/hooks/useAiChat";
import { useChatHistory } from "../../features/ai-chat/hooks/useChatHistory";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const AiChat = () => {
  useDocumentTitle("AI Assistant");
  const {
    messages,
    loading,
    sendUserMessage,
    startNewConversation,
    loadConversation,
  } = useAiChat();

  const [historyOpen, setHistoryOpen] = useState(false);
  const history = useChatHistory();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleOpenHistory = () => {
    setHistoryOpen(true);
    history.open();
  };

  const handleNewChat = () => {
    startNewConversation();
    setHistoryOpen(false);
  };

  const handleSelectSession = async (sessionId) => {
    try {
      const sessionMessages = await history.openSession(sessionId);
      loadConversation(sessionId, sessionMessages);
      setHistoryOpen(false);
    } catch {
      // Session load failed — keep the panel open so the user can retry.
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title="AI Assistant"
          subtitle="Your smart assistant for Egyptian government services."
        />
        <button
          type="button"
          onClick={handleOpenHistory}
          className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--primary)]"
        >
          <FiClock size={16} />
          History
        </button>
      </div>

      <div className="relative flex h-[calc(100vh-190px)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-primary)]">
        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 1 && (
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)]">
                <BsBank2 size={30} className="text-[var(--primary)]" />
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                GovGuide AI Assistant
              </h2>

              <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                Ask me anything about passports, national ID, licenses,
                government procedures and more.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendUserMessage} loading={loading} />

        <ChatHistoryPanel
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          sessions={history.sessions}
          loading={history.loading}
          loadingMore={history.loadingMore}
          error={history.error}
          hasMore={history.hasMore}
          onLoadMore={history.loadMore}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />
      </div>
    </>
  );
};

export default AiChat;
