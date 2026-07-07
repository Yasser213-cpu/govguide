import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input, Card } from "../../components/ui";
import { validateOtp } from "../../utils/validation";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    verifyOtp,
    resendOtp,
    loading,
    error: authError,
    setError: setAuthError,
  } = useAuth();

  const email =
    location.state?.email || sessionStorage.getItem("pendingEmail") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  // OTP expires in 1 min — start countdown at 60s
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAuthError(null);

    if (!validateOtp(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      await verifyOtp(email, otp);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Verification failed");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setAuthError(null);
    try {
      await resendOtp(email);
      setResendCountdown(60); // reset 1-min countdown
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)] p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)] text-center">
          {t("auth.verifyOtp")}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
          {t("auth.enterOtp")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t("auth.otp")}
            type="text"
            placeholder="000000"
            value={otp}
            onChange={handleChange}
            error={error}
            required
            maxLength="6"
            inputMode="numeric"
          />

          {(authError || error) && (
            <div className="rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm p-3">
              {authError || error}
            </div>
          )}

          <Button fullWidth loading={loading} type="submit" className="h-14">
            {t("auth.verifyOtp")}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            disabled={resendCountdown > 0 || loading}
            onClick={handleResendOtp}
            type="button"
          >
            {resendCountdown > 0
              ? `${t("auth.resendOtp")} (${formatCountdown(resendCountdown)})`
              : t("auth.resendOtp")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
