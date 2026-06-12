import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/ui";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getValidationErrors } from "../../utils/validation";
import { FiLock, FiMail, FiKey } from "react-icons/fi";
export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, loading, error: authError, setError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const fields = [
    { name: "email", type: "email", required: true },
    { name: "password", type: "password", required: true },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newErrors = getValidationErrors(formData, fields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-6 relative">
      <div className="absolute top-10 right-10 md:top-10 md:right-10 lg:top-12 lg:right-30 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[1100px] min-h-[700px] bg-[var(--background-primary)] rounded-[1rem] overflow-hidden grid gap-0 md:grid-cols-[40%_60%] shadow-xl">
        <div className="bg-gradient-to-b from-[var(--primary-light)] to-[var(--background-primary)] p-12 flex flex-col justify-between relative overflow-hidden">

          <div>
            <div className="flex items-center mb-12">
              <img src="/logo-full.png" alt="GovConnect AI" className="h-[73px] w-auto object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-4">Welcome Back!</h1>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-[320px]">
              Access government services securely and manage your account seamlessly.
            </p>
          </div>

          <div className="p-4 bg-[var(--background-primary)] rounded-xl border border-[var(--border)] relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <FiLock className="text-[var(--primary-dark)]" size={20} />
              <strong className="text-[var(--primary-dark)]">Secure Authentication</strong>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              Your information is protected using enterprise-grade security.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center p-12">
          <div className="w-full max-w-[450px]">
            <div className="flex items-center gap-3 mb-2">
              <FiMail className="text-[var(--primary)]" size={28} />
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">{t("auth.login")}</h2>
            </div>
            <p className="text-[var(--text-secondary)] mb-8">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label={t("auth.email")}
                type="email"
                name="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                label={t("auth.password")}
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <div className="text-right">
                <Link to="/forgot-password" className="text-[var(--primary)] font-medium text-sm hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>

              {(authError || errors.submit) && (
                <div className="rounded-md bg-[var(--danger-light)] text-[var(--danger)] px-4 py-3">
                  {authError || errors.submit}
                </div>
              )}

              <Button
                fullWidth
                loading={loading}
                type="submit"
                className="h-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none text-white"
              >
                {t("auth.login")}
              </Button>

              <p className="text-center text-[var(--text-secondary)] mt-2">
                {t("auth.noAccount")} {" "}
                <Link to="/register" className="text-[var(--primary)] font-semibold hover:underline">
                  {t("auth.register")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
