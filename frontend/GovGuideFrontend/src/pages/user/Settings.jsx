import { useTranslation } from "react-i18next";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTheme } from "../../hooks/useTheme";
import { usePageLoading } from "../../context/PageLoadingContext";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, toggleTheme, fontScale, setFontScale, fontScaleOptions } = useTheme();
  usePageLoading(loadingCompanies || loadingOrders);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {t("pages.settings.title") || "Settings"}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t("pages.settings.subtitle") || "Manage your preferences"}
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("common.language") || "Language"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("common.languageDescription") || "Switch between English and Arabic"}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("common.appearance") || "Appearance"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("common.darkModeDescription") || "Choose a light or dark look"}
            </p>
          </div>
          <Button onClick={toggleTheme} variant="outline">
            {theme === "dark" ? t("common.lightMode") || "Light Mode" : t("common.darkMode") || "Dark Mode"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("common.fontSize") || "Font Size"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("common.fontSizeDescription") || "Adjust the overall text scale across the app"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {fontScaleOptions.map((option) => (
              <Button
                key={option.value}
                variant={fontScale === option.value ? "primary" : "outline"}
                size="sm"
                onClick={() => setFontScale(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
