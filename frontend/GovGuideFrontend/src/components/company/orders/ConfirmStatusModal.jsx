import React from "react";

const BUTTON_VARIANTS = {
  primary: "bg-[var(--primary)] text-white hover:opacity-90",
  success: "bg-green-600 text-white hover:bg-green-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
};

export default function ConfirmStatusModal({
  action,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          {action.confirmTitle || "Confirm Action"}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {action.confirmMessage ||
            `Are you sure you want to change the order status to "${action.nextStatus}"?`}
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--background-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              BUTTON_VARIANTS[action.variant] ?? BUTTON_VARIANTS.primary
            }`}
          >
            {loading ? "Updating..." : action.label}
          </button>
        </div>
      </div>
    </div>
  );
}