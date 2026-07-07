import ChatHistoryItem from "./ChatHistoryItem";
import EmptyHistory from "./EmptyHistory";
import HistorySkeleton from "./HistorySkeleton";

export default function ChatHistorySidebar({
  history,
  activeId,
  loading,
  error,
  onSelect,
  onLoadMore,
  hasMore,
}) {
  return (
    <aside className="hidden w-full max-w-xs shrink-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background-primary)] shadow-sm lg:block">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Chat History
        </p>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
        </div>
      ) : error ? (
        <div className="p-5 text-sm text-[var(--danger)]">{error}</div>
      ) : history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {history.map((item) => (
            <ChatHistoryItem
              key={item.id}
              item={item}
              active={item.id === activeId}
              onSelect={() => onSelect(item.id)}
            />
          ))}
        </div>
      )}

      {hasMore && !loading && !error && history.length > 0 && (
        <div className="border-t border-[var(--border)] p-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-dark)]"
          >
            Load more
          </button>
        </div>
      )}
    </aside>
  );
}
