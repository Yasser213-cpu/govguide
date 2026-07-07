import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";
import Toast from "../../components/ui/Toast";
import { useCompany } from "../../context/CompanyContext";
import axiosClient from "../../api/axiosClient";

export default function CompanyProfile() {
  const { t } = useTranslation();
  const { company, loading, refreshCompany } = useCompany();
  const fileInputRef = useRef(null);

  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
    logo: null,
  });
  const [previewLogo, setPreviewLogo] = useState("");

  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name || "",
        description: company.description || "",
        phone: company.phone || "",
        governorate: company.governorate || "",
        city: company.city || "",
        street: company.street || "",
        logo: null,
      });

      const API_URL = "http://localhost:8000";

      setPreviewLogo(company.logo ? `${API_URL}${company.logo}` : "");
    }
  }, [company]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setCompanyData((prev) => ({
      ...prev,
      logo: file,
    }));

    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setCompanyData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (!company) {
        throw new Error("Company not found");
      }

      const formData = new FormData();

      formData.append("name", companyData.name);
      formData.append("description", companyData.description);
      formData.append("phone", companyData.phone);
      formData.append("governorate", companyData.governorate);
      formData.append("city", companyData.city);
      formData.append("street", companyData.street);

      if (companyData.logo) {
        formData.append("logo", companyData.logo);
      }

      await axiosClient.put(`/api/v1/companies/${company.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshCompany();

      setToast({
        show: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update company:", error);
      setToast({
        show: true,
        message: "Failed to update profile!",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title={t("pages.companyProfile.title")}
          subtitle={t("pages.companyProfile.subtitle")}
        />

        <div className="p-6">Loading company profile...</div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("pages.companyProfile.title")}
        subtitle={t("pages.companyProfile.subtitle")}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-6"
      >
        <div>
          <label className="mb-3 block font-medium">Company Logo</label>

          <div className="flex items-center gap-5">
            {previewLogo ? (
              <img
                src={previewLogo}
                alt="Company Logo"
                className="h-24 w-24 rounded-xl border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed text-sm text-gray-500">
                No Logo
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
              >
                {previewLogo ? "Change Logo" : "Add Logo"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Company Name</label>

          <input
            type="text"
            name="name"
            value={companyData.name}
            onChange={handleChange}
            className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Description</label>

          <textarea
            rows={4}
            name="description"
            value={companyData.description}
            onChange={handleChange}
            className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Phone</label>

          <input
            type="text"
            name="phone"
            value={companyData.phone}
            onChange={handleChange}
            className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">Governorate</label>

            <input
              type="text"
              name="governorate"
              value={companyData.governorate}
              onChange={handleChange}
              className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">City</label>

            <input
              type="text"
              name="city"
              value={companyData.city}
              onChange={handleChange}
              className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Street</label>

          <input
            type="text"
            name="street"
            value={companyData.street}
            onChange={handleChange}
            className="
            w-full
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--background-primary)]
            px-4
            py-3
            text-[var(--text-primary)]
            placeholder:text-[var(--text-secondary)]
            transition-all
            duration-200
            focus:outline-none
            focus:border-[var(--secondary)]
            focus:ring-2
            focus:ring-[var(--secondary-light)]
            "
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="
            rounded-lg
            bg-blue-600
            px-5
            py-3
            text-white
            disabled:opacity-50
          "
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </>
  );
}
