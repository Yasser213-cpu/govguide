import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiClock, FiCheckCircle, FiFileText } from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import DashboardStats from "../../components/dashboard/DashboardStats";
import { useCompany } from "../../context/CompanyContext";
import {
  getCompanyOrders,
  getCompanyOrder,
  updateOrderStatus,
} from "../../features/orders/api/Ordersapi";
import CompanyOrderCards from "../../components/company/dashboard/CompanyOrderCards";
import OrderDetailsPanel from "../../components/company/dashboard/OrderDetailsPanel";

const ACTIVE_STATUSES = ["accepted", "paid", "in_progress"];
const DASHBOARD_ORDERS_LIMIT = 5;

function computeOrderStats(orders) {
  return {
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };
}

export default function CompanyDashboard() {
  const { t } = useTranslation();
  const { company } = useCompany();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const data = await getCompanyOrders();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(list);
    } catch {
      setOrdersError("Failed to load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId) => {
    if (!orderId) return;
    try {
      setDetailLoading(true);
      setDetailError(null);
      const data = await getCompanyOrder(orderId);
      setOrderDetail(data);
    } catch {
      setOrderDetail(null);
      setDetailError("Failed to load order details. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderDetail(selectedOrderId);
    } else {
      setOrderDetail(null);
      setDetailError(null);
      setStatusError("");
    }
  }, [selectedOrderId, fetchOrderDetail]);

  const stats = useMemo(() => computeOrderStats(orders), [orders]);
  const recentOrders = useMemo(
    () => orders.slice(0, DASHBOARD_ORDERS_LIMIT),
    [orders],
  );

  const statItems = useMemo(
    () => [
      {
        title: "Active Orders",
        value: stats.active,
        icon: FiFileText,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      {
        title: "Pending",
        value: stats.pending,
        icon: FiClock,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      },
      {
        title: "Completed",
        value: stats.completed,
        icon: FiCheckCircle,
        color: "text-green-600",
        bg: "bg-green-100",
      },
    ],
    [stats],
  );

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
    setStatusError("");
  };

  const handleStatusChange = async (nextStatus) => {
    if (!selectedOrderId) return;
    try {
      setStatusUpdating(true);
      setStatusError("");
      await updateOrderStatus(selectedOrderId, nextStatus);
      await Promise.all([fetchOrderDetail(selectedOrderId), fetchOrders()]);
    } catch (err) {
      const msg =
        err?.response?.data?.status?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to update order status.";
      setStatusError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const companyName = company?.name || company?.company_name;

  return (
    <>
      <PageHeader
        title={
          companyName
            ? t("pages.companyDashboard.titleWithName", {
                name: companyName,
                defaultValue: `${companyName} Dashboard`,
              })
            : t("pages.companyDashboard.title")
        }
        subtitle={t("pages.companyDashboard.subtitle")}
      />

      <div className="space-y-10">
        <DashboardStats items={statItems} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CompanyOrderCards
              orders={recentOrders}
              loading={ordersLoading}
              error={ordersError}
              selectedOrderId={selectedOrderId}
              onSelectOrder={handleSelectOrder}
              onRefresh={fetchOrders}
              showViewAll
            />
          </div>

          <div className="lg:col-span-2">
            <OrderDetailsPanel
              order={selectedOrderId ? orderDetail : null}
              loading={detailLoading}
              error={detailError}
              onClose={() => setSelectedOrderId(null)}
              onRetry={() => fetchOrderDetail(selectedOrderId)}
              onStatusChange={handleStatusChange}
              statusUpdating={statusUpdating}
              statusError={statusError}
              showActions
            />
          </div>
        </div>
      </div>
    </>
  );
}
