import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { usePageLoading } from "../../context/PageLoadingContext";

export default function Dashboard() {
    const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  }, [i18n, isRTL]);
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  usePageLoading(loadingCompanies || loadingOrders);


  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] p-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 p-6 bg-[var(--background-primary)] rounded-2xl">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Welcome to {t("common.appName")}
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            {t("auth.logout")}
          </Button>
        </div>

        <div className="p-6 bg-[var(--background-primary)] rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Dashboard Content</h2>

          <p className="text-[var(--text-secondary)] mb-4">
            This is a protected route. You are authenticated as:
          </p>

          <div className="p-4 bg-[var(--background-secondary)] rounded-md">
            <p className="text-[var(--text-primary)]">
              User information will be displayed here once the API is connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
