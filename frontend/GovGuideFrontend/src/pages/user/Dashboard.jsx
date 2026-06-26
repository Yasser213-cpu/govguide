import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("pages.userDashboard.title")}
        subtitle={t("pages.userDashboard.subtitle")}
      />

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
        {t("pages.userDashboard.placeholder")}
      </div>
    </>
  );
}
