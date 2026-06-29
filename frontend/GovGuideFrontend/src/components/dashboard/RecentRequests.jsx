import { FiFileText } from "react-icons/fi";

export default function RecentRequests({ requests }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
      <h2 className="mb-5 text-xl font-bold">Recent Requests</h2>

      {requests.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-secondary)]">
          No requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
            >
              <div className="flex items-center gap-3">
                <FiFileText />

                <span>{request.title}</span>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                {request.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
