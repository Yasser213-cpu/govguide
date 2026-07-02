import { useState } from "react";
import { FiFileText, FiLoader, FiX } from "react-icons/fi";
import DocumentReviewCard from "./DocumentReviewCard";
import {
  resolveClientInfo,
  statusLabel,
  STATUS_STYLES,
  formatOrderDate,
  getAvailableStatusActions,
} from "../../../utils/orderHelpers";
import ConfirmStatusModal from "../orders/ConfirmStatusModal";

const BUTTON_VARIANTS = {
  primary: "bg-[var(--primary)] text-white hover:opacity-90",
  success: "bg-green-600 text-white hover:bg-green-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
};

export default function OrderDetailsPanel({
  order,
  loading,
  error,
  onClose,
  onRetry,
  onStatusChange,
  statusUpdating = false,
  showActions = false,
}) {
  const [pendingAction, setPendingAction] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-8">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <FiLoader className="animate-spin" />
          Loading order details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-3 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-8 text-center text-[var(--text-secondary)]">
        <FiFileText className="mb-3 text-3xl opacity-40" />
        <p className="text-sm">Select an order to review its documents.</p>
      </div>
    );
  }

  const documents = order.documents ?? [];
  const reviewCount = documents.filter((d) => d.needs_review).length;
  const statusClass = STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600";
  const { name, email } = resolveClientInfo(order);
  const actions = showActions ? getAvailableStatusActions(order.status) : [];

  const handleConfirm = async () => {
    if (!pendingAction || !onStatusChange) return;
    await onStatusChange(pendingAction.nextStatus);
    setPendingAction(null);
  };

  return (
    <>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">Order #{order.id}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
                {statusLabel(order.status)}
              </span>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">{name}</p>
              {email && (
                <p className="text-sm text-[var(--text-secondary)]">{email}</p>
              )}
            </div>

            {order.procedure && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Procedure: {order.procedure}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Created {formatOrderDate(order.created_at, true)}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--background-secondary)]"
              aria-label="Close order details"
            >
              <FiX />
            </button>
          )}
        </div>

        {showActions && actions.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2 border-b border-[var(--border)] pb-5">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                disabled={statusUpdating}
                onClick={() =>
                  action.confirmTitle
                    ? setPendingAction(action)
                    : onStatusChange?.(action.nextStatus)
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[action.variant] ?? BUTTON_VARIANTS.primary}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {order.notes && (
          <div className="mb-5 rounded-xl border border-[var(--border)] p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              Notes
            </p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{order.notes}</p>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Documents ({documents.length})
            </h3>
            {reviewCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {reviewCount} need review
              </span>
            )}
          </div>

          {documents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-secondary)]">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {[...documents]
                .sort((a, b) => Number(b.needs_review) - Number(a.needs_review))
                .map((doc) => (
                  <DocumentReviewCard
                    key={doc.id ?? `${doc.requirement}-${doc.file}`}
                    document={doc}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmStatusModal
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        loading={statusUpdating}
      />
      
    </>
  );
}
