import { Link, useNavigate } from "react-router-dom";
import { FiFileText, FiChevronRight, FiArrowRight } from "react-icons/fi";

const STATUS_STYLES = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
  accepted: { label: "Accepted", bg: "bg-blue-100", text: "text-blue-700" },
  paid: { label: "Paid", bg: "bg-blue-100", text: "text-blue-700" },
  in_progress: {
    label: "In Progress",
    bg: "bg-[var(--primary-light)]",
    text: "text-[var(--primary)]",
  },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  rejected: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_STYLES[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] animate-pulse"
        />
      ))}
    </div>
  );
}

export default function RecentRequests({ requests = [], loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Recent Requests</h2>

        <Link
          to="/user/my-requests"
          className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View All
          <FiArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <Skeleton />
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-secondary)]">
          No requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <button
              key={request.id}
              onClick={() => navigate(`/user/my-requests/${request.id}`)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--primary)] hover:shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FiFileText className="shrink-0 text-[var(--text-secondary)]" />

                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)]">
                    {request.procedure}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {request.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={request.status} />
                <FiChevronRight
                  size={16}
                  className="text-[var(--text-secondary)]"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
