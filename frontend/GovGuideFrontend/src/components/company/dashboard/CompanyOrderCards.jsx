import { FiFileText, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import OrderReviewFlag from "./OrderReviewFlag";
import {
  resolveClientInfo,
  statusLabel,
  STATUS_STYLES,
  formatOrderDate,
  countDocumentsNeedingReview,
  orderNeedsReview,
} from "../../../utils/orderHelpers";

export default function CompanyOrderCards({
  orders,
  loading,
  error,
  selectedOrderId,
  onSelectOrder,
  onRefresh,
  showViewAll = false,
  showRefresh = true,
  title = "Incoming Orders",
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {showRefresh && onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--background-secondary)]"
            aria-label="Refresh orders"
          >
            <FiRefreshCw />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-[var(--text-secondary)]">
          Loading orders...
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-red-600">{error}</p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Retry
            </button>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-secondary)]">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const { name } = resolveClientInfo(order);
            const isSelected = selectedOrderId === order.id;
            const reviewCount = countDocumentsNeedingReview(order);
            const needsReview = orderNeedsReview(order);
            const statusClass = STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600";

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder?.(order.id)}
                className={`relative flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary-light)]/40 shadow-sm"
                    : needsReview
                      ? "border-orange-300 bg-orange-50/30 hover:border-orange-400 hover:shadow-md"
                      : "border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md"
                }`}
              >
                {needsReview && (
                  <span className="absolute -top-2 end-3">
                    <OrderReviewFlag count={reviewCount} compact />
                  </span>
                )}

                <div className="flex min-w-0 items-center gap-3">
                  <FiFileText
                    className={`shrink-0 ${needsReview ? "text-orange-600" : "text-[var(--text-secondary)]"}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text-primary)]">
                      Order #{order.id}
                      {name !== "—" ? ` · ${name}` : ""}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {order.procedure || "—"} · {formatOrderDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <span
                  className={`ms-2 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                >
                  {statusLabel(order.status)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {showViewAll && !loading && !error && (
        <div className="mt-5 border-t border-[var(--border)] pt-4 text-center">
          <Link
            to="/company/orders"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary-light)]"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
