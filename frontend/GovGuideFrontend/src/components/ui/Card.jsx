export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`w-full rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
