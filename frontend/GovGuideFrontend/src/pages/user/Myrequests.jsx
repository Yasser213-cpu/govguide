import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiRefreshCw,
  FiAlertCircle,
  FiInbox,
  FiPlusCircle,
  FiCreditCard,
  FiLoader,
} from "react-icons/fi";
import { getMyOrders, payOrder } from "../../features/orders/api/Ordersapi";
import PageHeader from "../../components/layout/PageHeader";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-amber-400",
    progress: 20,
    tab: "pending",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-500",
    progress: 40,
    tab: "in_progress",
  },
  paid: {
    label: "Paid",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-500",
    progress: 55,
    tab: "in_progress",
  },
  in_progress: {
    label: "In Progress",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary-light)]",
    border: "border-[var(--primary)]/20",
    bar: "bg-[var(--primary)]",
    progress: 75,
    tab: "in_progress",
  },
  completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    bar: "bg-green-500",
    progress: 100,
    tab: "completed",
  },
  rejected: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-red-400",
    progress: 100,
    tab: "cancelled",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const pct = cfg.progress;
  const steps = getStepsForStatus(status);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">
          {steps.completed}/{steps.total} steps completed
        </span>
        <span className={`text-xs font-semibold ${cfg.color}`}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--border)]">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${cfg.bar} ${
            status === "rejected" ? "opacity-40" : ""
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function getStepsForStatus(status) {
  const map = {
    pending:     { completed: 1, total: 5 },
    accepted:    { completed: 2, total: 5 },
    paid:        { completed: 3, total: 5 },
    in_progress: { completed: 4, total: 5 },
    completed:   { completed: 5, total: 5 },
    rejected:    { completed: 1, total: 5 },
  };
  return map[status] ?? { completed: 1, total: 5 };
}

// ─── Status Icon ─────────────────────────────────────────────────────────────

function StatusIcon({ status }) {
  const iconProps = { size: 20 };
  if (status === "completed")
    return <FiCheckCircle {...iconProps} className="text-green-500" />;
  if (status === "rejected")
    return <FiXCircle {...iconProps} className="text-red-400" />;
  if (status === "in_progress" || status === "paid")
    return <FiRefreshCw {...iconProps} className="text-[var(--primary)]" />;
  if (status === "pending")
    return <FiClock {...iconProps} className="text-amber-500" />;
  if (status === "accepted")
    return <FiCreditCard {...iconProps} className="text-blue-500" />;
  return <FiFileText {...iconProps} className="text-[var(--text-secondary)]" />;
}

// ─── Pay Confirmation Modal ───────────────────────────────────────────────────

function PayModal({ order, onConfirm, onCancel, paying, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--background-primary)] border border-[var(--border)] p-6">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 mx-auto mb-4">
          <FiCreditCard size={26} className="text-blue-600" />
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-1">
          Confirm Payment
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-5">
          You're about to pay for{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {order.procedure}
          </span>{" "}
          with{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {order.company}
          </span>
          . This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">
            <FiAlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={paying}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] disabled:opacity-40 hover:bg-[var(--background-secondary)] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={paying}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {paying && <FiLoader size={14} className="animate-spin" />}
            {paying ? "Processing…" : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({ order, onClick, onPayClick }) {
  const timeAgo = formatTimeAgo(new Date(order.created_at));

  return (
    // outer div so the pay button click doesn't bubble up to navigate
    <div className="bg-[var(--background-primary)] border border-[var(--border)] rounded-xl px-5 py-4 hover:border-[var(--primary)] hover:shadow-sm transition-all group">
      {/* Clickable area — everything except the pay button */}
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-0.5 h-9 w-9 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
            <StatusIcon status={order.status} />
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="font-semibold text-[var(--text-primary)] truncate">
                  {order.procedure}
                </p>
                <StatusBadge status={order.status} />
              </div>
              <FiChevronRight
                size={16}
                className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] shrink-0 transition-colors"
              />
            </div>

            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {order.company}
            </p>

            {order.rejection_reason && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle size={12} />
                {order.rejection_reason}
              </p>
            )}

            <ProgressBar status={order.status} />

            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {order.status === "completed"
                ? `Completed ${timeAgo}`
                : order.status === "rejected"
                ? `Cancelled ${timeAgo}`
                : `Updated ${timeAgo}`}
            </p>
          </div>
        </div>
      </button>

      {/* Pay Now CTA — only when accepted */}
      {order.status === "accepted" && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <FiCreditCard size={15} />
            <span className="font-medium">Payment required to proceed</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPayClick(order);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shrink-0"
          >
            <FiCreditCard size={14} />
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onNewRequest }) {
  const messages = {
    all:         { title: "No requests yet",          body: "Start by contacting a company to submit your first request." },
    in_progress: { title: "Nothing in progress",      body: "Requests that are active will appear here." },
    pending:     { title: "No pending requests",      body: "Requests waiting for company review will appear here." },
    completed:   { title: "No completed requests",    body: "Finished requests will show up here." },
    cancelled:   { title: "No cancelled requests",    body: "Requests that were rejected will appear here." },
  };
  const { title, body } = messages[tab] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-4">
        <FiInbox size={28} className="text-[var(--primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs">{body}</p>
      {tab === "all" && (
        <button
          onClick={onNewRequest}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <FiPlusCircle size={16} />
          Find a Service
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-xl bg-[var(--background-primary)] border border-[var(--border)] animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString("en-EG", { month: "short", day: "numeric" });
}

function getTabCount(orders, tab) {
  if (tab === "all") return orders.length;
  if (tab === "cancelled") return orders.filter((o) => o.status === "rejected").length;
  if (tab === "in_progress") return orders.filter((o) => ["accepted", "paid", "in_progress"].includes(o.status)).length;
  return orders.filter((o) => o.status === tab).length;
}

function filterByTab(orders, tab) {
  if (tab === "all") return orders;
  if (tab === "cancelled") return orders.filter((o) => o.status === "rejected");
  if (tab === "in_progress") return orders.filter((o) => ["accepted", "paid", "in_progress"].includes(o.status));
  return orders.filter((o) => o.status === tab);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyRequests() {
  const navigate = useNavigate();

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Pay modal state
  const [payTarget, setPayTarget]   = useState(null); // order being paid
  const [paying, setPaying]         = useState(false);
  const [payError, setPayError]     = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : data.results ?? []);
      } catch {
        setError("Failed to load your requests. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => filterByTab(orders, activeTab), [orders, activeTab]);

  // ── Pay handlers ─────────────────────────────────────────────────────────

  const handlePayClick = (order) => {
    setPayTarget(order);
    setPayError("");
  };

  const handlePayCancel = () => {
    if (paying) return;
    setPayTarget(null);
    setPayError("");
  };

  const handlePayConfirm = async () => {
    if (!payTarget) return;
    setPaying(true);
    setPayError("");
    try {
      await payOrder(payTarget.id);
      // Optimistically update status in local state → no need for a refetch
      setOrders((prev) =>
        prev.map((o) => (o.id === payTarget.id ? { ...o, status: "paid" } : o))
      );
      setPayTarget(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Payment failed. Please try again.";
      setPayError(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My Requests"
        subtitle="Track and manage your paperwork requests"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {TABS.map((tab) => {
          const count = getTabCount(orders, tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-secondary)]"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--border)] text-[var(--text-secondary)]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && <Skeleton />}

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-5 py-4 text-sm">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState tab={activeTab} onNewRequest={() => navigate("/user/companies")} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <RequestCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/user/requests/${order.id}`)}
              onPayClick={handlePayClick}
            />
          ))}
        </div>
      )}

      {/* Pay confirmation modal */}
      {payTarget && (
        <PayModal
          order={payTarget}
          onConfirm={handlePayConfirm}
          onCancel={handlePayCancel}
          paying={paying}
          error={payError}
        />
      )}
    </>
  );
}