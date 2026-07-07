export default function PhoneInput({
  value,
  onChange,
  error = "",
  label = "",
  required = false,
  className = "",
  ...props
}) {
  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value.replace(/\D/g, "");
    onChange(phoneValue);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
          {label}
          {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}

      <div className="flex w-full gap-2 items-center">
        <div
          className={`min-w-[70px] rounded-md border px-3 py-3 text-base font-medium text-[var(--text-primary)] bg-[var(--background-secondary)] text-center ${
            error ? "border-[var(--danger)]" : "border-[var(--border)]"
          }`}
        >
          +20
        </div>

        <div className="flex-1">
          <input
            type="tel"
            placeholder="1012345678"
            value={value}
            onChange={handlePhoneChange}
            className={`w-full rounded-md border px-4 py-3 text-base bg-[var(--background-primary)] text-[var(--text-primary)] transition duration-200 ease-in-out focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              error ? "border-[var(--danger)]" : "border-[var(--border)]"
            }`}
            {...props}
          />
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
