import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import PageHeader from "../../components/layout/PageHeader";
import { useUser } from "../../context/UserContext";

import { getCompanies } from "../../api/companyApi";
import { getMyOrders } from "../../features/orders/api/Ordersapi";

import DashboardStats from "../../components/dashboard/DashboardStats";
import AiAssistantCard from "../../components/dashboard/AiAssistantCard";
import RecentRequests from "../../components/dashboard/RecentRequests";
import RecommendedCompanies from "../../components/dashboard/RecommendedCompanies";
import { usePageLoading } from "../../context/PageLoadingContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useUser();

  const [recommendedCompanies, setRecommendedCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Dashboard is only "ready" once BOTH fetches finish
  usePageLoading(loadingCompanies || loadingOrders);

  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  useEffect(() => {
    fetchRecommendedCompanies();
    fetchOrders();
  }, []);

  const fetchRecommendedCompanies = async () => {
    try {
      setLoadingCompanies(true);

      const res = await getCompanies({
        ordering: "-average_rating",
      });

      setRecommendedCompanies((res.data.results || []).slice(0, 4));
    } catch (err) {
      console.error("Failed to load recommended companies", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // ── Stats derived from orders ──────────────────────────────────────────
  const stats = useMemo(() => {
    const active = orders.filter((o) =>
      ["accepted", "paid", "in_progress"].includes(o.status),
    ).length;

    const pending = orders.filter((o) => o.status === "pending").length;

    const completed = orders.filter((o) => o.status === "completed").length;

    return { active, pending, completed };
  }, [orders]);

  // ── Recent requests (latest 5, newest first) ───────────────────────────
  const recentRequests = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [orders]);

  return (
    <>
      <PageHeader
        title={t("pages.userDashboard.title", {
          name: capitalize(user?.first_name || user?.username),
        })}
        subtitle={t("pages.userDashboard.subtitle")}
      />

      <div className="space-y-10">
        <DashboardStats
          active={stats.active}
          pending={stats.pending}
          completed={stats.completed}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiAssistantCard />
          </div>

          <RecentRequests requests={recentRequests} loading={loadingOrders} />
        </div>

        <RecommendedCompanies
          companies={recommendedCompanies}
          loading={loadingCompanies}
        />
      </div>
    </>
  );
}
