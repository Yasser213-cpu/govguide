import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createCompany } from "../../api/companyApi";
import { Button, Input } from "../../components/ui";
import { FiBriefcase, FiMapPin, FiPhone, FiFileText } from "react-icons/fi";

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
  "Fayoum", "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya",
  "New Valley", "North Sinai", "Port Said", "Qalyubia", "Luxor",
  "Qena", "South Sinai", "Sohag", "Suez", "Aswan", "Assiut",
  "Beni Suef", "Matruh", "Kafr El Sheikh", "Sharqia", "Damietta",
];

const initialForm = {
  name: "",
  description: "",
  phone: "",
  governorate: "",
  city: "",
  street: "",
};

export default function CreateCompany() {
  const navigate = useNavigate();
  const { markCompanyCreated } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required";
    else if (formData.name.length > 100) newErrors.name = "Max 100 characters";

    if (!formData.description.trim()) newErrors.description = "Description is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+?[1-9]\d{6,14}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid phone number (e.g. +201001234567)";
    }

    if (!formData.governorate) newErrors.governorate = "Governorate is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    else if (formData.city.length > 100) newErrors.city = "Max 100 characters";
    if (!formData.street.trim()) newErrors.street = "Street is required";
    else if (formData.street.length > 100) newErrors.street = "Max 100 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createCompany(formData);
      markCompanyCreated(); // update context so CompanyRoute unlocks
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        // Field-level errors from API
        const apiErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          apiErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(apiErrors);
      } else {
        setSubmitError(data?.detail || err.message || "Failed to create company");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center p-6">
      <div className="w-full max-w-[1000px] bg-[var(--background-primary)] rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-[38%_62%]">

        {/* ── Left panel ── */}
        <div className="bg-gradient-to-b from-[var(--primary-light)] to-[var(--background-primary)] p-10 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <img src="/logo-full.png" alt="GovConnect AI" className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--primary-dark)] mb-3 leading-tight">
              Set up your company profile
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              This information will appear to clients browsing for service providers.
              Make sure your details are accurate and up to date.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4 mt-8">
            {[
              { icon: FiBriefcase, label: "Company info", done: true },
              { icon: FiMapPin, label: "Location details", done: true },
              { icon: FiPhone, label: "Contact number", done: true },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  <Icon size={15} />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="p-10 overflow-y-auto">
          <div className="flex items-center gap-2 mb-1">
            <FiFileText className="text-[var(--primary)]" size={22} />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Company details</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-7">
            Fill in your company information to start receiving bookings.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Name */}
            <Input
              label="Company name"
              name="name"
              type="text"
              placeholder="Al-Nour Legal Services"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Description <span className="text-[var(--danger)]">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Briefly describe your services and what makes you reliable..."
                value={formData.description}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 text-sm bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none outline-none transition-colors
                  ${errors.description
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--primary)]"
                  }`}
              />
              {errors.description && (
                <p className="text-xs text-[var(--danger)]">{errors.description}</p>
              )}
            </div>

            {/* Phone */}
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+201001234567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />

            {/* Governorate */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Governorate <span className="text-[var(--danger)]">*</span>
              </label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 text-sm bg-[var(--background-primary)] text-[var(--text-primary)] outline-none transition-colors
                  ${errors.governorate
                    ? "border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--primary)]"
                  }`}
              >
                <option value="">Select governorate</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.governorate && (
                <p className="text-xs text-[var(--danger)]">{errors.governorate}</p>
              )}
            </div>

            {/* City + Street side by side */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                type="text"
                placeholder="Nasr City"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
              />
              <Input
                label="Street"
                name="street"
                type="text"
                placeholder="Abbas El-Akkad St"
                value={formData.street}
                onChange={handleChange}
                error={errors.street}
                required
              />
            </div>

            {submitError && (
              <div className="rounded-lg bg-[var(--danger-light)] text-[var(--danger)] text-sm px-4 py-3">
                {submitError}
              </div>
            )}

            <Button
              fullWidth
              type="submit"
              loading={loading}
              className="h-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none text-white mt-1"
            >
              Create company profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}