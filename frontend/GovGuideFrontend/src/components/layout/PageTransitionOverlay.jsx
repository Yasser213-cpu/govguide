/**
 * Small overlay spinner shown by AppLayout whenever the current
 * page reports it's still loading (via usePageLoading()).
 * Doesn't unmount the page — just covers it until data is ready.
 */
export default function PageTransitionOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--background-primary)]/80 backdrop-blur-[100px]">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-light)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--primary)] animate-spin" />
      </div>
    </div>
  );
}
