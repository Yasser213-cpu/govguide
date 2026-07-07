import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

export default function ServiceModal({
  open,
  service,
  onClose,
  onSave,
  saving = false,
  error,
}) {
  const [formData, setFormData] = useState({
    procedure: "",
    company_service_fee: "",
    estimated_completion_days: "",
    is_available: true,
  });

  const [procedures, setProcedures] = useState([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);

  // Placeholders derived from the selected procedure's default price/days
  const [feePlaceholder, setFeePlaceholder] = useState("");
  const [daysPlaceholder, setDaysPlaceholder] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  // =========================
  // Reset form on close/open mode
  // =========================
  useEffect(() => {
    if (!open) return;

    if (service) {
      setFormData({
        procedure: service?.company_offerings?.id || "",
        company_service_fee: service.company_service_fee || "",
        estimated_completion_days: service.estimated_completion_days || "",
        is_available: service.is_available ?? true,
      });
    } else {
      setFormData({
        procedure: "",
        company_service_fee: "",
        estimated_completion_days: "",
        is_available: true,
      });
      setFeePlaceholder("");
      setDaysPlaceholder("");
    }
  }, [open, service]);

  // =========================
  // Fetch procedures ONLY in create mode
  // =========================
  useEffect(() => {
    if (!open || service) return;

    const fetchProcedures = async () => {
      setLoadingProcedures(true);

      try {
        const res = await axiosClient.get("/api/v1/procedures/");

        setProcedures(
          Array.isArray(res.data) ? res.data : res.data?.results || [],
        );
      } catch (err) {
        console.error("Failed to load procedures:", err);
      } finally {
        setLoadingProcedures(false);
      }
    };

    fetchProcedures();
  }, [open, service]);

  // =========================
  // handlers
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Special handler for the procedure select: also updates the
  // fee/days placeholders based on the chosen procedure's defaults.
  const handleProcedureChange = (e) => {
    const { value } = e.target;

    setFormData((prev) => ({ ...prev, procedure: value }));

    const selected = procedures.find((p) => String(p.id) === String(value));

    if (selected) {
      const defaultFee = selected.estimated_government_fee ?? "";
      const defaultDays = selected.estimated_processing_days ?? "";

      setFeePlaceholder(defaultFee !== "" ? String(defaultFee) : "");
      setDaysPlaceholder(defaultDays !== "" ? String(defaultDays) : "");
    } else {
      setFeePlaceholder("");
      setDaysPlaceholder("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {" "}
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {service ? "Edit Service" : "Create Service"}
          </h2>

          {/* ❌ ERROR MESSAGE (new) */}
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Procedure */}
          <div>
            <label className="mb-2 block font-medium">Procedure</label>

            {service ? (
              <input
                disabled
                value={service?.company_offerings?.name || ""}
                className="w-full rounded-xl border bg-gray-100 px-4 py-3"
              />
            ) : (
              <select
                name="procedure"
                value={formData.procedure}
                onChange={handleProcedureChange}
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="">Select procedure</option>

                {loadingProcedures ? (
                  <option>Loading...</option>
                ) : (
                  procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Fee */}
          <div>
            <label
              className="mb-2 block font-medium"
              htmlFor="company_service_fee"
            >
              Service Fee (EGP)
            </label>

            <input
              type="number"
              name="company_service_fee"
              value={formData.company_service_fee}
              onChange={handleChange}
              placeholder={feePlaceholder}
              className="w-full rounded-xl border px-4 py-3"
              id="company_service_fee"
            />
          </div>

          {/* Days */}
          <div>
            <label className="mb-2 block font-medium">
              Estimated Completion Days
            </label>

            <input
              type="number"
              name="estimated_completion_days"
              value={formData.estimated_completion_days}
              onChange={handleChange}
              placeholder={daysPlaceholder}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Available */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            Available
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
