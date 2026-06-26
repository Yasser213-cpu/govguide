import { useState } from "react";
import { FiSend } from "react-icons/fi";

const ChatInput = ({ onSend, loading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    onSend(message);
    setMessage("");
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background-primary)] p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          autoFocus
          disabled={loading}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
