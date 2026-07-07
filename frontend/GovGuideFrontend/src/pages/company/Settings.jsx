import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTheme } from "../../hooks/useTheme";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, toggleTheme, fontScale, setFontScale, fontScaleOptions } =
    useTheme();

  return (
    <>
      <PageHeader
        title={t("pages.companySettings.title")}
        subtitle={t("pages.companySettings.subtitle")}
      />

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t("common.language") || "Language"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("common.languageDescription") ||
                  "Switch between English and Arabic"}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t("common.appearance") || "Appearance"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("common.darkModeDescription") ||
                  "Choose a light or dark look"}
              </p>
            </div>
            <Button onClick={toggleTheme} variant="outline">
              {theme === "dark"
                ? t("common.lightMode") || "Light Mode"
                : t("common.darkMode") || "Dark Mode"}
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
                {t("common.fontSizeDescription") ||
                  "Adjust the overall text scale across the app"}
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
    </>
  );
}
