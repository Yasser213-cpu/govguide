import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import PageHeader from "../../components/layout/PageHeader";
import { useUser } from "../../context/UserContext";

import { getCompanies } from "../../api/companyApi";

import DashboardStats from "../../components/dashboard/DashboardStats";
import AiAssistantCard from "../../components/dashboard/AiAssistantCard";
import RecentRequests from "../../components/dashboard/RecentRequests";
import RecommendedCompanies from "../../components/dashboard/RecommendedCompanies";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useUser();

  const [recommendedCompanies, setRecommendedCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  useEffect(() => {
    fetchRecommendedCompanies();
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

  return (
    <>
      <PageHeader
        title={t("pages.userDashboard.title", {
          name: capitalize(user?.first_name || user?.username),
        })}
        subtitle={t("pages.userDashboard.subtitle")}
      />

      <div className="space-y-10">
        <DashboardStats active={0} pending={0} completed={0} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiAssistantCard />
          </div>

          <RecentRequests requests={[]} />
        </div>

        <RecommendedCompanies
          companies={recommendedCompanies}
          loading={loadingCompanies}
        />
      </div>
    </>
  );
}
