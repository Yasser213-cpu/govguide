import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiInbox } from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/ui/Pagination";
import { getCompanyOrders } from "../../features/orders/api/Ordersapi";
import CompanyOrderCards from "../../components/company/dashboard/CompanyOrderCards";

const PAGE_SIZE = 5;

export default function CompanyOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCompanyOrders();
      const list = Array.isArray(data) ? data : data.results ?? [];
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(list);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page > 1) {
      setSearchParams({ page: String(page) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        title={t("pages.companyOrders.title", { defaultValue: "Orders" })}
        subtitle={t("pages.companyOrders.subtitle", {
          defaultValue: "Review and manage all incoming orders",
        })}
      />

      {!loading && !error && (
        <p className="mb-5 text-sm text-[var(--text-secondary)]">
          {orders.length > 0
            ? `Showing ${paginatedOrders.length} of ${orders.length} orders`
            : "No orders found"}
        </p>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-[var(--danger-light)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--background-primary)]"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] py-24 text-center">
          <FiInbox className="mb-3 text-3xl text-[var(--text-secondary)] opacity-40" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No orders yet
          </h3>
          <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
            Incoming client orders will appear here once submitted.
          </p>
        </div>
      ) : (
        <>
          <CompanyOrderCards
            orders={paginatedOrders}
            loading={false}
            error=""
            title="All Orders"
            onSelectOrder={(id) => navigate(`/company/orders/${id}`)}
            showRefresh={false}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}
