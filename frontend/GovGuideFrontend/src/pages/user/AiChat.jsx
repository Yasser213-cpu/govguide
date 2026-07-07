import { useEffect, useRef } from "react";
import { BsBank2 } from "react-icons/bs";
import PageHeader from "../../components/layout/PageHeader";
import ChatMessage from "../../features/ai-chat/components/ChatMessage";
import ChatInput from "../../features/ai-chat/components/ChatInput";
import TypingIndicator from "../../features/ai-chat/components/TypingIndicator";
import { useAiChat } from "../../features/ai-chat/hooks/useAiChat";

const AiChat = () => {
  const { messages, loading, sendUserMessage } = useAiChat();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <>
      <PageHeader
        title="AI Assistant"
        subtitle="Your smart assistant for Egyptian government services."
      />

      <div className="flex h-[calc(100vh-190px)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-primary)]">
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
      </div>
    </>
  );
};

export default AiChat;
