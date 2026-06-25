import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";
import axiosClient from "../../api/axiosClient";

export default function Services() {
  const { t } = useTranslation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axiosClient.get("/v1/services/");

      // TODO: Replace hardcoded company id with authenticated company id
      const companyServices = response.data.results.filter(
        (service) => service.company === 1,
      );

      setServices(companyServices);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("pages.companyServices.title")}
        subtitle={t("pages.companyServices.subtitle")}
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
        {loading ? (
          <div className="text-center text-[var(--text-secondary)]">
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)]">
            No services found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="p-3">Procedure</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Authority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="p-3 font-medium">
                      {service.company_offerings.name}
                    </td>

                    <td className="p-3">{service.company_service_fee} EGP</td>

                    <td className="p-3">{service.estimated_completion_days}</td>

                    <td className="p-3">
                      {service.company_offerings.government_authority}
                    </td>

                    <td className="p-3">
                      {service.is_available ? "✅ Available" : "❌ Unavailable"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
