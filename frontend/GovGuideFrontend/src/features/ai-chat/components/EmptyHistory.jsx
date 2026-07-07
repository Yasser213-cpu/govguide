export default function EmptyHistory() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center text-sm text-[var(--text-secondary)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
        H
      </div>
      <p className="max-w-[220px] text-sm leading-6">
        No chat history yet. Start a conversation and your requests will appear
        here.
      </p>
    </div>
  );
}
