import { useEffect, useRef } from "react";
import { BsBank2 } from "react-icons/bs";
import PageHeader from "../../components/layout/PageHeader";
import ChatMessages from "../../features/ai-chat/components/ChatMessages";
import ChatInput from "../../features/ai-chat/components/ChatInput";
import ChatHistorySidebar from "../../features/ai-chat/components/ChatHistorySidebar";
import TypingIndicator from "../../features/ai-chat/components/TypingIndicator";
import { useAiChat } from "../../features/ai-chat/hooks/useAiChat";
import { useAuth } from "../../hooks/useAuth";

const AiChat = () => {
  const { isAuthenticated } = useAuth();
  const {
    messages,
    loading,
    sendUserMessage,
    history,
    activeHistoryId,
    historyLoading,
    historyError,
    hasMoreHistory,
    selectHistoryItem,
    handleLoadMoreHistory,
  } = useAiChat();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      <PageHeader
        title="AI Assistant"
        subtitle="Your smart assistant for Egyptian government services."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {isAuthenticated && (
          <ChatHistorySidebar
            history={history}
            activeId={activeHistoryId}
            loading={historyLoading}
            error={historyError}
            onSelect={selectHistoryItem}
            onLoadMore={handleLoadMoreHistory}
            hasMore={hasMoreHistory}
          />
        )}

        <div className="flex h-[calc(100vh-190px)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-primary)]">
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

            <ChatMessages messages={messages} />

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={sendUserMessage} loading={loading} />
        </div>
      </div>
    </>
  );
};

export default AiChat;
