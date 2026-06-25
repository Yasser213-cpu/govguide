import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";

export default function Settings() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("pages.companySettings.title")}
        subtitle={t("pages.companySettings.subtitle")}
      />

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
        {t("pages.companySettings.placeholder")}
      </div>
    </>
  );
}
