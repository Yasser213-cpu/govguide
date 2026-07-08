import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiMessageCircle,
  FiCheck,
} from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../features/notifications/notificationsApi";
import { getMyOrders } from "../../features/orders/api/Ordersapi";
import useUnreadNotificationsCount from "../../features/notifications/useUnreadNotificationsCount";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// ─── STATUS STYLE MAP ───────────────────────────────

const STATUS_STYLE = {
  accepted: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    icon: <FiCreditCard className="text-blue-600" />,
    label: "Order Accepted",
  },
  rejected: {
    bg: "bg-red-50",
    border: "border-red-200",
    hoverBorder: "hover:border-red-400",
    icon: <FiXCircle className="text-red-500" />,
    label: "Order Rejected",
  },
  paid: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    hoverBorder: "hover:border-indigo-400",
    icon: <FiCreditCard className="text-indigo-600" />,
    label: "Payment Confirmed",
  },
  completed: {
    bg: "bg-green-50",
    border: "border-green-200",
    hoverBorder: "hover:border-green-400",
    icon: <FiCheckCircle className="text-green-600" />,
    label: "Order Completed",
  },
  chat_message: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    hoverBorder: "hover:border-sky-400",
    icon: <FiMessageCircle className="text-sky-600" />,
    label: "New Message",
  },
  default: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    hoverBorder: "hover:border-gray-300",
    icon: <FiBell className="text-gray-500" />,
    label: "Notification",
  },
};

// ─── DATE HELPERS ───────────────────────────────

function getDateGroup(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const start7Days = new Date(startToday);
  start7Days.setDate(start7Days.getDate() - 7);

  if (date >= startToday) return "Today";
  if (date >= startYesterday && date < startToday) return "Yesterday";
  if (date >= start7Days) return "Last 7 Days";
  return "Older";
}

function groupNotifications(list) {
  const groups = {};

  list.forEach((n) => {
    const key = getDateGroup(n.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return groups;
}

function applyFilters(list, filter) {
  const now = new Date();

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const start7Days = new Date(startToday);
  start7Days.setDate(start7Days.getDate() - 7);

  return list.filter((n) => {
    const date = new Date(n.created_at);

    if (filter === "read") return n.is_read;
    if (filter === "unread") return !n.is_read;
    if (filter === "today") return date >= startToday;
    if (filter === "yesterday")
      return date >= startYesterday && date < startToday;
    if (filter === "week") return date >= start7Days;

    return true;
  });
}

function getOrderTitle(orderId, orders) {
  return orders.find((o) => o.id === orderId)?.procedure;
}

// ─── PAGE ───────────────────────────────

export default function Notifications() {
  useDocumentTitle("Notifications");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const { refresh: refreshUnreadCount } = useUnreadNotificationsCount();

  useEffect(() => {
    async function load() {
      try {
        const [notifRes, ordersRes] = await Promise.all([
          getNotifications(),
          getMyOrders(),
        ]);

        setNotifications(notifRes.results || []);
        setOrders(ordersRes.results || []);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, []);

  const markOneAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );

    try {
      await markNotificationAsRead(id);
      refreshUnreadCount();
    } catch (err) {
      console.log(err);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: false } : item,
        ),
      );
    }
  };

  const handleMarkAsReadClick = (e, n) => {
    e.stopPropagation();
    if (n.is_read) return;
    markOneAsRead(n.id);
  };

  const handleNotificationClick = async (n) => {
    const isChat = n.notification_type === "chat_message";

    if (!n.is_read) {
      await markOneAsRead(n.id);
    }

    if (isChat) {
      navigate("/user/messages");
    } else if (n.order) {
      navigate(`/user/my-requests/${n.order}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await markAllNotificationsAsRead();
      refreshUnreadCount();
    } catch (err) {
      console.log(err);
    }
  };

  const filtered = useMemo(
    () => applyFilters(notifications, filter),
    [notifications, filter],
  );

  const grouped = useMemo(() => groupNotifications(filtered), [filtered]);

  const getStyle = (type) => STATUS_STYLE[type] || STATUS_STYLE.default;

  const ORDER = ["Today", "Yesterday", "Last 7 Days", "Older"];

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your orders"
      />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "read", "today", "yesterday", "week"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm capitalize
                  ${
                    filter === f
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background-secondary)] text-[var(--text-secondary)]"
                  }
                `}
            >
              {f}
            </button>
          ))}
        </div>

        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {ORDER.map((group) => {
            if (!grouped[group]) return null;

            return (
              <div key={group}>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase">
                  {group}
                </h3>

                <div className="flex flex-col gap-3">
                  {grouped[group].map((n) => {
                    const style = getStyle(n.notification_type);
                    const isChat = n.notification_type === "chat_message";

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`
                          border rounded-xl p-4 cursor-pointer transition
                          hover:shadow-sm
                          ${n.is_read ? "bg-white border-gray-200" : `${style.bg} ${style.border}`}
                          ${style.hoverBorder}
                          ${!n.is_read ? "ring-1 ring-blue-100" : ""}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* ICON */}
                          <div
                            className={`h-9 w-9 flex items-center justify-center rounded-lg ${
                              n.is_read ? "bg-gray-100" : "bg-white/60"
                            }`}
                          >
                            {style.icon}
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm font-semibold ${
                                  n.is_read
                                    ? "text-[var(--text-secondary)]"
                                    : "text-[var(--text-primary)]"
                                }`}
                              >
                                {isChat
                                  ? style.label
                                  : (() => {
                                      const title = getOrderTitle(
                                        n.order,
                                        orders,
                                      );
                                      return title
                                        ? `${title} #${n.order}`
                                        : `${style.label} #${n.order}`;
                                    })()}
                              </p>

                              {!n.is_read && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsReadClick(e, n)}
                                  className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 transition"
                                  title="Mark as read"
                                >
                                  <FiCheck size={12} />
                                  Mark as read
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                              {isChat
                                ? n.message
                                : new Date(n.created_at).toLocaleString()}
                            </p>

                            {isChat && (
                              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            )}

                            <span
                              className={`text-xs font-medium mt-2 inline-block ${
                                n.is_read ? "text-gray-400" : "text-blue-600"
                              }`}
                            >
                              {n.is_read ? "Read" : "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
