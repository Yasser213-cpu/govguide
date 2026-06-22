import { useState } from "react";

const ChatInput = ({ onSend, loading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 border-t"
    >
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 border rounded-lg px-4 py-2"
      />

      <button
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;