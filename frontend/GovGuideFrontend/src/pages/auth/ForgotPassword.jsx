import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input, Card } from "../../components/ui";
import {
  validateEmail,
  validatePassword,
  validateOtp,
} from "../../utils/validation";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    forgetPassword,
    resetPassword,
    loading,
    error: authError,
    setError,
  } = useAuth();

  // 3 steps: "email" → "otp" → "reset"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Step 1 — send OTP to email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    if (!validateEmail(email)) {
      setErrors({ email: t("validation.invalidEmail") });
      return;
    }

    try {
      await forgetPassword(email);
      setStep("otp");
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    if (!validateOtp(otp)) {
      setErrors({ otp: t("validation.invalidOtp") });
      return;
    }

    setStep("reset");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    if (!validatePassword(newPassword)) {
      setErrors({
        newPassword: t("validation.passwordRequirements"),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({
        confirmPassword: t("validation.passwordsDoNotMatch"),
      });
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      navigate("/login");
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)] p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)] text-center">
          {t("auth.resetPassword")}
        </h1>

        {/* Step 1 */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
              {t("auth.resetPasswordDescription")}
            </p>

            <Input
              label={t("auth.email")}
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              error={errors.email}
              required
            />

            {(authError || errors.submit) && (
              <div className="rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm p-3">
                {authError || errors.submit}
              </div>
            )}

            <Button fullWidth loading={loading} type="submit" className="h-14">
              {t("auth.sendResetCode")}
            </Button>

            <Link
              to="/login"
              className="text-sm text-[var(--primary)] text-center hover:underline"
            >
              {t("auth.backToLogin")}
            </Link>
          </form>
        )}

        {/* Step 2 */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
              {t("auth.enterOtpMessage", { email })}
            </p>

            <Input
              label={t("auth.otp")}
              type="text"
              placeholder={t("auth.otpPlaceholder")}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (errors.otp) setErrors({});
              }}
              error={errors.otp}
              required
              maxLength="6"
              inputMode="numeric"
            />

            {(authError || errors.submit) && (
              <div className="rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm p-3">
                {authError || errors.submit}
              </div>
            )}

            <Button fullWidth type="submit" className="h-14">
              {t("auth.verifyCode")}
            </Button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-sm text-[var(--primary)] underline text-center"
            >
              {t("auth.useDifferentEmail")}
            </button>
          </form>
        )}

        {/* Step 3 */}
        {step === "reset" && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
              {t("auth.enterNewPassword")}
            </p>

            <Input
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors({});
              }}
              error={errors.newPassword}
              required
            />

            <Input
              label={t("auth.confirmPassword")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({});
              }}
              error={errors.confirmPassword}
              required
            />

            {(authError || errors.submit) && (
              <div className="rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm p-3">
                {authError || errors.submit}
              </div>
            )}

            <Button fullWidth loading={loading} type="submit" className="h-14">
              {t("auth.resetPassword")}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
