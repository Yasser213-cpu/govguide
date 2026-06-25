import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";
import axiosClient from "../../api/axiosClient";

export default function CompanyProfile() {
  const { t } = useTranslation();

  const [companyData, setCompanyData] = useState({
    name: "",
    description: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  // TODO: Replace hardcoded company id with authenticated company id
  const fetchCompany = async () => {
    try {
      const response = await axiosClient.get("/v1/companies/1");

      setCompanyData(response.data);
    } catch (error) {
      console.error("Failed to load company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCompanyData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(companyData);

    alert("Profile update will be enabled when auth is ready");
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
          <label className="mb-2 block font-medium">Company Name</label>

          <input
            type="text"
            name="name"
            value={companyData.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Description</label>

          <textarea
            rows={4}
            name="description"
            value={companyData.description}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Phone</label>

          <input
            type="text"
            name="phone"
            value={companyData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
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
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">City</label>

            <input
              type="text"
              name="city"
              value={companyData.city}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
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
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}
