import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import TypingIndicator from "../components/TypingIndicator";
import { useAiChat } from "../hooks/useAiChat";

const AiChat = () => {
  const { messages, loading, sendUserMessage } =
    useAiChat();

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}

        {loading && <TypingIndicator />}
      </div>

      <ChatInput
        onSend={sendUserMessage}
        loading={loading}
      />
    </div>
  );
};

export default AiChat;