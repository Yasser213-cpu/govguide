import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/ui";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getValidationErrors } from "../../utils/validation";
import { FiLock, FiUserPlus, FiUser, FiBriefcase } from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, loading, error: authError, setError } = useAuth();

  const roles = [
    { value: "client", label: t("auth.citizen"), icon: FiUser },
    { value: "company", label: t("auth.company"), icon: FiBriefcase },
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const fields = [
    { name: "first_name", type: "text", required: true },
    { name: "last_name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "username", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "password", type: "password", required: true },
    {
      name: "confirmPassword",
      type: "password",
      required: true,
      matchField: "password",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  // const handlePhoneChange = (value) => {
  //   setFormData((prev) => ({ ...prev, phone: value }));
  //   if (errors.phone) {
  //     setErrors((prev) => ({ ...prev, phone: "" }));
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newErrors = getValidationErrors(formData, fields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(
        formData.first_name,
        formData.last_name,
        formData.username,
        formData.email,
        formData.role,
        formData.password,
      );
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-6 relative">
      <div className="absolute top-10 right-10 md:top-10 md:right-10 lg:top-12 lg:right-20 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[1200px] bg-[var(--background-primary)] rounded-[1rem] overflow-hidden grid gap-0 md:grid-cols-[40%_60%] shadow-xl">
        <div className="bg-gradient-to-b from-[var(--primary-light)] to-[var(--background-primary)] p-12 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center mb-12">
              <img
                src="/logo-full.png"
                alt="GovConnect AI"
                className="h-[73px] w-auto object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-4">
              {t("auth.createAccountTitle")}
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-[320px]">
              {t("auth.registerDescription")}
            </p>
          </div>

          <div className="p-4 bg-[var(--background-primary)] rounded-xl border border-[var(--border)] relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <FiLock className="text-[var(--primary-dark)]" size={20} />
              <strong className="text-[var(--primary-dark)]">
                {t("auth.secureRegistration")}
              </strong>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {t("auth.registrationSecurityDescription")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center p-12">
          <div className="w-full max-w-[500px]">
            <div className="flex items-center gap-3 mb-2">
              <FiUserPlus className="text-[var(--primary)]" size={28} />
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                {t("auth.register")}
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] mb-8">
              {t("auth.createAccount")}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label={t("auth.firstName")}
                type="text"
                name="first_name"
                placeholder={t("auth.firstNamePlaceholder")}
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                label={t("auth.lastName")}
                type="text"
                name="last_name"
                placeholder={t("auth.lastNamePlaceholder")}
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
              <Input
                label={t("auth.username")}
                type="text"
                name="username"
                placeholder={t("auth.usernamePlaceholder")}
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                required
              />

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

              {/* Role Radio Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  {t("auth.accountType")}
                </label>
                <div className="flex gap-3">
                  {roles.map((role) => {
                    const isActive = formData.role === role.value;
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.value}
                        onClick={() => handleRoleChange(role.value)}
                        className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all
                          ${
                            isActive
                              ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                              : "border-[var(--border)] bg-[var(--background-primary)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                          }
                        `}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all
                            ${isActive ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]"}
                          `}
                        >
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <Icon size={16} />
                        <span className="text-sm font-medium">
                          {role.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="text-xs text-[var(--danger)]">{errors.role}</p>
                )}
              </div>

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

              <Input
                label={t("auth.confirmPassword")}
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

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
                {t("auth.register")}
              </Button>

              <p className="text-center text-[var(--text-secondary)] mt-2">
                {t("auth.haveAccount")}{" "}
                <Link
                  to="/login"
                  className="text-[var(--primary)] font-semibold hover:underline"
                >
                  {t("auth.login")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
