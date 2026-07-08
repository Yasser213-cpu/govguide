import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";

export default function Users() {
    const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  }, [i18n, isRTL]);
  const { t, i18n } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("pages.adminUsers.title")}
        subtitle={t("pages.adminUsers.subtitle")}
      />

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] p-12 text-center text-[var(--text-secondary)]">
        {t("pages.adminUsers.placeholder")}
      </div>
    </>
  );
}
