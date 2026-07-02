import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiFileText,
  FiFile,
  FiImage,
  FiLoader,
  FiDownload,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiCreditCard,
  FiCalendar,
  FiBriefcase,
} from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import { getOrderById } from "../../features/orders/api/Ordersapi";
import { usePageLoading } from "../../context/PageLoadingContext";

// ─── Status config (mirrors MyRequests for visual consistency) ───────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-amber-400",
    progress: 20,
    icon: FiClock,
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-500",
    progress: 40,
    icon: FiCreditCard,
  },
  paid: {
    label: "Paid",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    bar: "bg-blue-500",
    progress: 55,
    icon: FiRefreshCw,
  },
  in_progress: {
    label: "In Progress",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary-light)]",
    border: "border-[var(--primary)]/20",
    bar: "bg-[var(--primary)]",
    progress: 75,
    icon: FiRefreshCw,
  },
  completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    bar: "bg-green-500",
    progress: 100,
    icon: FiCheckCircle,
  },
  rejected: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-red-400",
    progress: 100,
    icon: FiXCircle,
  },
};

function getSteps(status) {
  const map = {
    pending: { completed: 1, total: 5 },
    accepted: { completed: 2, total: 5 },
    paid: { completed: 3, total: 5 },
    in_progress: { completed: 4, total: 5 },
    completed: { completed: 5, total: 5 },
    rejected: { completed: 1, total: 5 },
  };
  return map[status] ?? { completed: 1, total: 5 };
}

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

function ProgressBar({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const steps = getSteps(status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--text-secondary)]">
          {steps.completed}/{steps.total} steps completed
        </span>
        <span className={`text-xs font-semibold ${cfg.color}`}>
          {cfg.progress}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--border)]">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${cfg.bar} ${
            status === "rejected" ? "opacity-40" : ""
          }`}
          style={{ width: `${cfg.progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── File helpers ──────────────────────────────────────────────────────────

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (IMAGE_EXT.includes(ext)) {
    return { Icon: FiImage, color: "text-purple-500", bg: "bg-purple-50" };
  }
  if (ext === "pdf") {
    return { Icon: FiFileText, color: "text-red-500", bg: "bg-red-50" };
  }
  if (["doc", "docx"].includes(ext)) {
    return { Icon: FiFileText, color: "text-blue-500", bg: "bg-blue-50" };
  }
  return {
    Icon: FiFile,
    color: "text-[var(--text-secondary)]",
    bg: "bg-[var(--background-secondary)]",
  };
}

// ─── Info item (small building block for the info card) ──────────────────────

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[var(--text-secondary)]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageLoading(loading);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load request details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cfg = order ? STATUS_CONFIG[order.status] : null;
  const StatusHeroIcon = cfg?.icon ?? FiFileText;

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
      >
        <FiArrowLeft />
        Back to requests
      </button>

      <PageHeader
        title="Order Details"
        subtitle="View the full details of your paperwork request"
      />

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-5 py-4 text-sm">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {order && !error && (
        <div className="flex flex-col gap-3">
          {/* Hero / status card */}
          <div
            className={`rounded-xl border px-5 py-4 ${cfg?.border ?? "border-[var(--border)]"} ${cfg?.bg ?? "bg-[var(--background-primary)]"}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-9 w-9 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                <StatusHeroIcon size={20} className={cfg?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-semibold text-[var(--text-primary)] truncate">
                    {order.procedure}
                  </p>
                  <StatusBadge status={order.status} />
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
              </div>
            </div>
          </div>

          {/* Request info + notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                Request Information
              </h2>
              <div className="space-y-4">
                <InfoItem
                  icon={FiBriefcase}
                  label="Company"
                  value={order.company}
                />
                <InfoItem
                  icon={FiFileText}
                  label="Service"
                  value={order.procedure}
                />
                <InfoItem
                  icon={FiCalendar}
                  label="Created At"
                  value={formatDate(order.created_at)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Notes
              </h2>
              <p className="text-sm text-[var(--text-secondary)] min-h-[3rem] leading-relaxed">
                {order.notes || "No notes provided."}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Uploaded Documents
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Documents attached to this request.
              </p>
            </div>

            {order.documents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.documents.map((document) => {
                  const fileName = document.file
                    ? document.file.split("/").pop()
                    : "Document";
                  const fileUrl = document.file
                    ? new URL(document.file, "http://localhost:8000").toString()
                    : "#";
                  const { Icon, color, bg } = getFileIcon(fileName);

                  return (
                    <a
                      key={`${document.requirement}-${document.file}`}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 hover:border-[var(--primary)] hover:shadow-sm transition-all"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon size={18} className={color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Requirement #{document.requirement}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {fileName}
                        </p>
                      </div>
                      <FiDownload
                        size={15}
                        className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] shrink-0 transition-colors"
                      />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-secondary)] p-6 text-sm text-[var(--text-secondary)] text-center">
                No documents have been uploaded for this request yet.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
