import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import { getCompanyInsights } from "../../features/insights/api/insightsApi";
import { getProcedures, getServices } from "../../api/companyApi";
import { useCompany } from "../../context/CompanyContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function CompanyInsights() {
  useDocumentTitle("Company Insights");
  const { t } = useTranslation();
  const { company } = useCompany();

  const [procedures, setProcedures] = useState([]);
  const [procedureId, setProcedureId] = useState("");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!company?.id) {
      setProcedures([]);
      setProcedureId("");
      setInsights(null);
      return;
    }

    const loadProcedures = async () => {
      try {
        const procedureRes = await getProcedures();
        const procedureList = Array.isArray(procedureRes.data)
          ? procedureRes.data
          : (procedureRes.data.results ?? []);

        let serviceList = company?.company_services ?? [];
        if (!serviceList.length) {
          const serviceRes = await getServices({ company: company.id });
          serviceList = Array.isArray(serviceRes.data)
            ? serviceRes.data
            : (serviceRes.data.results ?? []);
        }

        const availableProcedureIds = new Set(
          serviceList
            .map(
              (service) => service?.procedure ?? service?.company_offerings?.id,
            )
            .filter(Boolean)
            .map(String),
        );

        const filteredProcedures = procedureList
          .filter((procedure) =>
            availableProcedureIds.has(String(procedure.id)),
          )
          .map((procedure) => ({ id: procedure.id, name: procedure.name }));

        setProcedures(filteredProcedures);
      } catch (error) {
        setProcedures([]);
      }
    };

    loadProcedures();
  }, [company?.id]);

  const fetchInsights = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanyInsights(id);
      setInsights(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load insights. Please try again.",
      );
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProcedureChange = (e) => {
    const id = e.target.value;
    setProcedureId(id);
    if (!id) {
      setInsights(null);
      return;
    }
    fetchInsights(id);
  };

  return (
    <>
      <PageHeader
        title={t("pages.companyInsights.title", {
          defaultValue: "Company Insights",
        })}
        subtitle={t("pages.companyInsights.subtitle", {
          defaultValue:
            "See how you rank against competitors and how to improve.",
        })}
      />

      <div className="space-y-6">
        <select
          value={procedureId}
          onChange={handleProcedureChange}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">
            {t("pages.companyInsights.selectProcedure", {
              defaultValue: "Select a procedure",
            })}
          </option>
          {procedures.map((procedure) => (
            <option key={procedure.id} value={procedure.id}>
              {procedure.name}
            </option>
          ))}
        </select>

        {loading && (
          <p>{t("common.loading", { defaultValue: "Loading..." })}</p>
        )}
        {error && <p className="text-red-600">{error}</p>}

        {insights && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 lg:col-span-2">
              <div className="text-lg font-semibold">
                {t("pages.companyInsights.rank", {
                  defaultValue: "ترتيبك: {{rank}} من {{total}}",
                  rank: insights.rank ?? "-",
                  total: insights.total ?? "-",
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                <FiCheckCircle />{" "}
                {t("pages.companyInsights.strengths", {
                  defaultValue: "Strengths",
                })}
              </h3>
              {!(
                Array.isArray(insights.strengths) &&
                insights.strengths.length > 0
              ) ? (
                <p className="text-sm text-gray-500">—</p>
              ) : (
                <ul className="space-y-2" dir="rtl">
                  {insights.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700">
                <FiAlertTriangle />{" "}
                {t("pages.companyInsights.weaknesses", {
                  defaultValue: "Areas to improve",
                })}
              </h3>
              {!(
                Array.isArray(insights.weaknesses) &&
                insights.weaknesses.length > 0
              ) ? (
                <p className="text-sm text-gray-500">—</p>
              ) : (
                <ul className="space-y-2" dir="rtl">
                  {insights.weaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
