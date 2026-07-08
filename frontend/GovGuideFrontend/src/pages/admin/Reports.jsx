import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";

export default function Reports() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("pages.adminReports.title")}
        subtitle={t("pages.adminReports.subtitle")}
      />

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
        {t("pages.adminReports.placeholder")}
      </div>
    </>
  );
}
