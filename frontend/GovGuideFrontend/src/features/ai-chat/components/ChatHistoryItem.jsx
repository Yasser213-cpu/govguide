const truncate = (text, maxLength) =>
  text?.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

const formatDate = (createdAt) => {
  try {
    return new Date(createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return createdAt;
  }
};

export default function ChatHistoryItem({ item, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-2 px-5 py-4 text-left transition hover:bg-[var(--background-secondary)] ${
        active ? "bg-[var(--background-secondary)]" : "bg-transparent"
      }`}
    >
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {truncate(item.message, 40)}
      </span>
      <span className="text-sm text-[var(--text-secondary)]">
        {truncate(item.answer, 60)}
      </span>
      <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-light)]">
        {formatDate(item.created_at)}
      </span>
    </button>
  );
}
