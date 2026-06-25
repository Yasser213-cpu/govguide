import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";

export default function CompanyNotifications() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("pages.companyNotifications.title")}
        subtitle={t("pages.companyNotifications.subtitle")}
      />

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
        {t(`pages.companyNotifications.placeholder`)}
      </div>
    </>
  );
}
