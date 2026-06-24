export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
