import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-secondary)] p-6 text-center">
      <h1 className="text-4xl font-bold mb-6 text-[var(--primary)]">
        {t("common.appName")}
      </h1>

      <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl">
        Your gateway to government services and information
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/login" className="no-underline">
          <Button size="lg">{t("auth.login")}</Button>
        </Link>

        <Link to="/register" className="no-underline">
          <Button size="lg" variant="outline">
            {t("auth.register")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
