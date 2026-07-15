import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiLoader, FiExternalLink } from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTheme } from "../../hooks/useTheme";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getCompanyStripeStatus, startStripeOnboarding } from "../../api/companyApi";

function StripeConnectCard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const stripeReturn = searchParams.get("stripe");

  const [status, setStatus] = useState(null); // { connected, onboarding_complete }
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    try {
      setLoadingStatus(true);
      setError("");
      const { data } = await getCompanyStripeStatus();
      setStatus(data);
    } catch {
      setError("Failed to load payment setup status.");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After returning from Stripe's onboarding flow, re-check status.
  // (?stripe=complete or ?stripe=refresh appended by the backend's
  // return_url / refresh_url)
  useEffect(() => {
    if (stripeReturn) {
      loadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeReturn]);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const { data } = await startStripeOnboarding();
      window.location.href = data.onboarding_url;
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to start Stripe onboarding. Please try again.",
      );
      setConnecting(false);
    }
  };

  const isComplete = status?.onboarding_complete;
  const isConnectedNotComplete = status?.connected && !status?.onboarding_complete;

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {t("common.payments") || "Payments"}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("common.paymentsDescription") ||
              "Connect your Stripe account to receive payments directly for completed orders."}
          </p>

          {!loadingStatus && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              {isComplete ? (
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <FiCheckCircle size={15} />
                  Connected — you can receive payments
                </span>
              ) : isConnectedNotComplete ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <FiAlertCircle size={15} />
                  Setup started — finish onboarding to receive payments
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                  <FiAlertCircle size={15} />
                  Not connected yet
                </span>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-red-500">
              <FiAlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        <Button
          onClick={handleConnect}
          disabled={connecting || loadingStatus || isComplete}
          variant={isComplete ? "outline" : "primary"}
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <FiLoader size={14} className="animate-spin" />
              Redirecting…
            </span>
          ) : isComplete ? (
            "Connected"
          ) : isConnectedNotComplete ? (
            <span className="flex items-center gap-2">
              <FiExternalLink size={14} />
              Finish Setup
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FiExternalLink size={14} />
              Connect Stripe
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
}

export default function Settings() {
  useDocumentTitle("Settings");
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
        <StripeConnectCard />

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
                {t("common.darkModeDescription") || "Choose a light or dark look"}
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