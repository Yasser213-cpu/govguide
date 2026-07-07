import ChatMessage from "./ChatMessage";

export default function ChatMessages({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
