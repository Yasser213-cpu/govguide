export function resolveClientInfo(order) {
  if (!order) return { name: "—", email: "" };

  if (order.client_name || order.client_email) {
    return {
      name: order.client_name || "—",
      email: order.client_email || "",
    };
  }

  if (order.client && typeof order.client === "object") {
    const c = order.client;
    const name =
      [c.first_name, c.last_name].filter(Boolean).join(" ") ||
      c.username ||
      "—";
    return { name, email: c.email || "" };
  }

  const client = order.client || "";
  if (typeof client === "string" && client.includes("@")) {
    return {
      name: order.client_username || client.split("@")[0] || "—",
      email: client,
    };
  }

  return { name: client || "—", email: order.client_email || "" };
}

export function statusLabel(status) {
  if (status === "in_progress") return "In Progress";
  if (status === "rejected") return "Rejected";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
}

export const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  paid: "bg-blue-100 text-blue-700",
  in_progress: "bg-[var(--primary-light)] text-[var(--primary)]",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export function formatOrderDate(iso, withTime = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

const STATUS_TRANSITIONS = {
  pending: ["pending", "accepted", "rejected"],
  paid: ["paid", "in_progress"],
  in_progress: ["in_progress", "completed"],
  accepted: ["accepted"],
  completed: ["completed"],
  rejected: ["rejected"],
};

export function getStatusSelectOptions(currentStatus) {
  const statuses = STATUS_TRANSITIONS[currentStatus] ?? [currentStatus];
  return statuses.map((value) => ({ value, label: statusLabel(value) }));
}

export function canChangeOrderStatus(currentStatus) {
  return getStatusSelectOptions(currentStatus).length > 1;
}

export function countDocumentsNeedingReview(order) {
  return (order?.documents ?? []).filter((d) => d.needs_review).length;
}

export function orderNeedsReview(order) {
  return countDocumentsNeedingReview(order) > 0;
}

export function collectVerificationFlags(order) {
  const flags = new Set();
  for (const doc of order?.documents ?? []) {
    for (const flag of doc.verification_flags ?? []) {
      flags.add(flag);
    }
  }
  return [...flags];
}

export const VERIFICATION_FLAG_LABELS = {
  low_confidence: "Low Confidence",
  little_text: "Little Text",
  type_uncertain: "Type Uncertain",
};

export function getAvailableStatusActions(status) {
  switch (status) {
    case "pending":
      return [
        {
          key: "accept",
          label: "Accept Order",
          nextStatus: "accepted",
          variant: "primary",
        },
        {
          key: "reject",
          label: "Reject Order",
          nextStatus: "rejected",
          variant: "danger",
          confirmTitle: "Reject Order",
          confirmMessage:
            "This order will be rejected and the client will be notified.",
        },
      ];
    case "paid":
      return [
        {
          key: "start",
          label: "Start Processing",
          nextStatus: "in_progress",
          variant: "primary",
        },
      ];
    case "in_progress":
      return [
        {
          key: "complete",
          label: "Mark Completed",
          nextStatus: "completed",
          variant: "success",
        },
      ];
    default:
      return [];
  }
}
