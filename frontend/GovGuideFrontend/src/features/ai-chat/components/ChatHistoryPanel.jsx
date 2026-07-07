import { FiX, FiClock, FiPlus } from "react-icons/fi";

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const SessionItem = ({ session, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(session.session_id)}
    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-primary)] px-4 py-3 text-left transition-all hover:border-[var(--primary)]"
  >
    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
      {session.preview || "New conversation"}
    </p>

    <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
      <FiClock size={12} />
      {formatDate(session.last_message_at)}
      <span>
        {session.message_count}{" "}
        {session.message_count === 1 ? "message" : "messages"}
      </span>
    </div>
  </button>
);

/**
 * Slide-in panel listing the user's past AI chat sessions.
 * Data/loading/pagination state comes from useChatHistory (parent owns it),
 * this component is purely presentational.
 */
const ChatHistoryPanel = ({
  open,
  onClose,
  sessions,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onSelectSession,
  onNewChat,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-sm flex-col border-l border-[var(--border)] bg-[var(--background-primary)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Chat History
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-light)]"
            >
              <FiPlus size={14} />
              New Chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--background-secondary)]"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && (
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Loading...
            </p>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && sessions.length === 0 && (
            <p className="text-center text-sm text-[var(--text-secondary)]">
              No past conversations yet.
            </p>
          )}

          {sessions.map((session) => (
            <SessionItem
              key={session.session_id}
              session={session}
              onSelect={onSelectSession}
            />
          ))}

          {hasMore && !loading && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-light)] disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPanel;
