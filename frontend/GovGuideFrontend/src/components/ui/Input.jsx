export default function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = "",
  label = "",
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
          {label}
          {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-md border px-4 py-3 text-base bg-[var(--background-primary)] text-[var(--text-primary)] transition duration-200 ease-in-out focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-[var(--danger)]" : "border-[var(--border)]"
          }`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
