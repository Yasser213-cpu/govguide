export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variantClasses = {
    primary:
      "bg-[var(--primary)] text-[var(--text-inverse)] border border-[var(--primary)] hover:bg-[var(--primary-dark)]",
    secondary:
      "bg-[var(--secondary)] text-[var(--text-inverse)] border border-[var(--secondary)] hover:bg-[var(--secondary-light)] focus:ring-[var(--secondary)]",
    outline:
      "bg-transparent text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-light)]",
    ghost:
      "bg-transparent text-[var(--primary)] border-none hover:bg-[var(--primary-light)]",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "inline-flex";
  const classes = [
    baseClasses,
    variantClasses[variant] ?? variantClasses.primary,
    sizeClasses[size] ?? sizeClasses.md,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
