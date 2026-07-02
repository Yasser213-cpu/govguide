import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import OrderDetailsPanel from "../../components/company/dashboard/OrderDetailsPanel";
import {
  getCompanyOrder,
  updateOrderStatus,
} from "../../features/orders/api/Ordersapi";

export default function CompanyOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCompanyOrder(id);
      setOrder(data);
    } catch {
      setOrder(null);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (nextStatus) => {
    try {
      setStatusUpdating(true);
      setStatusError("");
      await updateOrderStatus(id, nextStatus);
      await fetchOrder();
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

  return (
    <>
      <PageHeader
        title={`Order #${id}`}
        subtitle="Review documents, OCR flags, and update order status"
      />

      <Link
        to="/company/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        <FiArrowLeft />
        Back to Orders
      </Link>

      <OrderDetailsPanel
        order={order}
        loading={loading}
        error={error}
        onRetry={fetchOrder}
        onClose={() => navigate("/company/orders")}
        onStatusChange={handleStatusChange}
        statusUpdating={statusUpdating}
        statusError={statusError}
        showActions
      />
    </>
  );
}
