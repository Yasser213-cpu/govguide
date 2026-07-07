export default function HistorySkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-[var(--background-secondary)] p-4">
      <div className="h-4 w-3/4 rounded-full bg-[var(--background-primary)]" />
      <div className="mt-3 h-3 w-full rounded-full bg-[var(--background-primary)]" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-[var(--background-primary)]" />
    </div>
  );
}
