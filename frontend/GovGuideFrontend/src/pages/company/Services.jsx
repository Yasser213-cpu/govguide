import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/layout/PageHeader";
import axiosClient from "../../api/axiosClient";
import { useCompany } from "../../context/CompanyContext";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ServiceModal from "../../components/layout/company/ServiceModal";
import ConfirmDeleteModal from "../../components/layout/company/ConfirmDeleteModal";
import Toast from "../../components/ui/Toast";
import { usePageLoading } from "../../context/PageLoadingContext";

export default function Services() {
  usePageLoading(loadingCompanies || loadingOrders);
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { company, loading: companyLoading } = useCompany();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const [editForm, setEditForm] = useState({
    company_service_fee: "",
    estimated_completion_days: "",
    is_available: true,
  });

  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const resetModal = () => {
    setEditingService(null);
    setIsCreating(false);
    setError("");
  };

  useEffect(() => {
    if (editingService) {
      setEditForm({
        company_service_fee: editingService.company_service_fee || "",
        estimated_completion_days:
          editingService.estimated_completion_days || "",
        is_available: editingService.is_available ?? true,
      });
      return;
    }

    if (isCreating) {
      setEditForm({
        company_service_fee: "",
        estimated_completion_days: "",
        is_available: true,
      });
    }
  }, [editingService, isCreating]);

  useEffect(() => {
    if (company?.id) {
      fetchServices();
    }
  }, [company]);

  const fetchServices = async () => {
    if (!company?.id) return;

    setLoading(true);

    try {
      const response = await axiosClient.get(
        `/api/v1/companies/${company.id}/services`,
      );

      setServices(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (service) => {
    setDeleteTarget(service);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await axiosClient.delete(`/api/v1/services/${deleteTarget.id}`);

      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));

      setDeleteTarget(null);
      setToast({
        show: true,
        message: "Service deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    setError("");

    try {
      if (
        !formData.procedure ||
        !formData.company_service_fee ||
        !formData.estimated_completion_days
      ) {
        setError("Please fill in all required fields.");
        setSaving(false);
        return;
      }

      const duplicate = services.some(
        (s) => s.company_offerings?.id === Number(formData.procedure),
      );

      if (!editingService && duplicate) {
        setError("This service already exists.");
        setSaving(false);
        return;
      }

      const payload = {
        company: company.id,
        procedure: Number(formData.procedure),
        company_service_fee: Number(formData.company_service_fee),
        estimated_completion_days: Number(formData.estimated_completion_days),
        is_available: Boolean(formData.is_available),
      };

      if (editingService) {
        const res = await axiosClient.put(
          `/api/v1/services/${editingService.id}`,
          payload,
        );

        setServices((prev) =>
          prev.map((s) => (s.id === res.data.id ? res.data : s)),
        );

        setToast({
          show: true,
          message: "Service updated successfully.",
          type: "success",
        });
      } else {
        const res = await axiosClient.post(`/api/v1/services/`, payload);

        setServices((prev) => [res.data, ...prev]);

        setToast({
          show: true,
          message: "Service created successfully.",
          type: "success",
        });
      }

      resetModal();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);

      setToast({
        show: true,
        message: "Something went wrong.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {}, [isCreating, editingService]);

  return (
    <>
      <PageHeader
        title={t("pages.companyServices.title")}
        subtitle={t("pages.companyServices.subtitle")}
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
        <button
          onClick={() => {
            resetModal();
            setError("");
            setIsCreating(true);
          }}
          className="mb-4 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          + Add Service
        </button>

        {loading || companyLoading ? (
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
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    onClick={() => {
                      setEditingService(service);
                      setIsCreating(false);
                      setError("");
                    }}
                    className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <td className="p-3 font-medium">
                      {service.company_offerings?.name}
                    </td>

                    <td className="p-3">{service.company_service_fee} EGP</td>

                    <td className="p-3">{service.estimated_completion_days}</td>

                    <td className="p-3">
                      {service.company_offerings?.government_authority}
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {service.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setError("");
                            setEditingService(service);
                          }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <FiEdit2 size={18} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(service);
                          }}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ServiceModal
        open={!!editingService || isCreating}
        service={editingService}
        editForm={editForm}
        setEditForm={setEditForm}
        saving={saving}
        onClose={() => {
          resetModal();
        }}
        onSave={handleSave}
        error={error}
        setError={setError}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.company_offerings?.name}"?`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

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
