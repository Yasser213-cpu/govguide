import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";

const emptyNewRequirement = () => ({ title: "", description: "" });

export default function ProcedureModal({
  open,
  onClose,
  onSave,
  saving = false,
  error,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimated_government_fee: "",
    estimated_processing_days: "",
    government_authority: "",
    is_active: true,
  });

  const [localError, setLocalError] = useState("");

  // ===== Requirements =====
  const [requirements, setRequirements] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [selectedRequirementIds, setSelectedRequirementIds] = useState([]);
  const [requirementSearch, setRequirementSearch] = useState("");

  // Inline "create a new requirement" mini form
  const [newRequirement, setNewRequirement] = useState(emptyNewRequirement());
  const [creatingRequirement, setCreatingRequirement] = useState(false);
  const [requirementCreateError, setRequirementCreateError] = useState("");

  // ===== Also add as a service for my company =====
  const [addAsService, setAddAsService] = useState(true);
  const [serviceData, setServiceData] = useState({
    company_service_fee: "",
    estimated_completion_days: "",
    is_available: true,
  });

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Reset everything each time the modal opens, and load existing requirements
  useEffect(() => {
    if (!open) return;

    setFormData({
      name: "",
      description: "",
      estimated_government_fee: "",
      estimated_processing_days: "",
      government_authority: "",
      is_active: true,
    });
    setSelectedRequirementIds([]);
    setRequirementSearch("");
    setNewRequirement(emptyNewRequirement());
    setRequirementCreateError("");
    setLocalError("");
    setAddAsService(true);
    setServiceData({
      company_service_fee: "",
      estimated_completion_days: "",
      is_available: true,
    });

    fetchRequirements();
  }, [open]);

  // Keep the "add as service" fee/days in sync with the procedure's own
  // fee/days as the user types them, unless the person already edited the
  // service fields themselves (tracked via touched flags below).
  const [serviceFeeTouched, setServiceFeeTouched] = useState(false);
  const [serviceDaysTouched, setServiceDaysTouched] = useState(false);

  useEffect(() => {
    if (!serviceFeeTouched) {
      setServiceData((prev) => ({
        ...prev,
        company_service_fee: formData.estimated_government_fee,
      }));
    }
  }, [formData.estimated_government_fee, serviceFeeTouched]);

  useEffect(() => {
    if (!serviceDaysTouched) {
      setServiceData((prev) => ({
        ...prev,
        estimated_completion_days: formData.estimated_processing_days,
      }));
    }
  }, [formData.estimated_processing_days, serviceDaysTouched]);

  const fetchRequirements = async () => {
    setLoadingRequirements(true);

    try {
      const res = await axiosClient.get("/api/v1/requirements/");
      setRequirements(
        Array.isArray(res.data) ? res.data : res.data?.results || [],
      );
    } catch (err) {
      console.error("Failed to load requirements:", err);
    } finally {
      setLoadingRequirements(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "company_service_fee") setServiceFeeTouched(true);
    if (name === "estimated_completion_days") setServiceDaysTouched(true);

    setServiceData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleRequirement = (id) => {
    setSelectedRequirementIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  // Creates a brand new requirement on the backend, then auto-selects it.
  // Blocks duplicates (case-insensitive match against existing titles).
  const handleCreateRequirement = async () => {
    setRequirementCreateError("");

    const trimmedTitle = newRequirement.title.trim();

    if (!trimmedTitle) {
      setRequirementCreateError("Requirement title is required.");
      return;
    }

    const duplicate = requirements.find(
      (r) => r.title?.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    );

    if (duplicate) {
      setRequirementCreateError(
        `"${duplicate.title}" already exists — select it from the list above instead.`,
      );

      // Auto-select the existing one so the person isn't stuck
      if (!selectedRequirementIds.includes(duplicate.id)) {
        setSelectedRequirementIds((prev) => [...prev, duplicate.id]);
      }
      return;
    }

    setCreatingRequirement(true);

    try {
      const res = await axiosClient.post("/api/v1/requirements/", {
        title: trimmedTitle,
        description: newRequirement.description.trim(),
      });

      setRequirements((prev) => [res.data, ...prev]);
      setSelectedRequirementIds((prev) => [...prev, res.data.id]);
      setNewRequirement(emptyNewRequirement());
    } catch (err) {
      console.error("Failed to create requirement:", err);
      setRequirementCreateError(
        err.response?.data?.title?.[0] ||
          err.response?.data?.detail ||
          "Could not create the requirement.",
      );
    } finally {
      setCreatingRequirement(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!formData.name.trim() || !formData.description.trim()) {
      setLocalError("Procedure name and description are required.");
      return;
    }

    if (selectedRequirementIds.length === 0) {
      setLocalError("Select or add at least one requirement.");
      return;
    }

    if (
      addAsService &&
      (!serviceData.company_service_fee ||
        !serviceData.estimated_completion_days)
    ) {
      setLocalError(
        "Fill in the service fee and completion days, or uncheck 'Add as a service'.",
      );
      return;
    }

    const procedurePayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      government_authority: formData.government_authority.trim(),
      is_active: formData.is_active,
      requirement_ids: selectedRequirementIds,
    };

    if (formData.estimated_government_fee !== "") {
      procedurePayload.estimated_government_fee = Number(
        formData.estimated_government_fee,
      );
    }

    if (formData.estimated_processing_days !== "") {
      procedurePayload.estimated_processing_days = Number(
        formData.estimated_processing_days,
      );
    }

    const servicePayload = addAsService
      ? {
          company_service_fee: Number(serviceData.company_service_fee),
          estimated_completion_days: Number(
            serviceData.estimated_completion_days,
          ),
          is_available: Boolean(serviceData.is_available),
        }
      : null;

    onSave(procedurePayload, servicePayload);
  };

  if (!open) return null;

  const displayedError = error || localError;

  const filteredRequirements = requirements.filter((r) =>
    r.title?.toLowerCase().includes(requirementSearch.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create Procedure</h2>

          {displayedError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
              {displayedError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block font-medium">Procedure Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Commercial Registration"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Government authority */}
          <div>
            <label className="mb-2 block font-medium">
              Government Authority
            </label>
            <input
              type="text"
              name="government_authority"
              value={formData.government_authority}
              onChange={handleChange}
              placeholder="e.g. GAFI"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Fee */}
          <div>
            <label className="mb-2 block font-medium">
              Estimated Government Fee (EGP)
            </label>
            <input
              type="number"
              name="estimated_government_fee"
              value={formData.estimated_government_fee}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Days */}
          <div>
            <label className="mb-2 block font-medium">
              Estimated Processing Days
            </label>
            <input
              type="number"
              name="estimated_processing_days"
              value={formData.estimated_processing_days}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active (visible to companies immediately)
          </label>

          {/* Requirements */}
          <div>
            <label className="mb-2 block font-medium">Requirements</label>

            <input
              type="text"
              placeholder={
                loadingRequirements ? "Loading..." : "Search requirements..."
              }
              value={requirementSearch}
              onChange={(e) => setRequirementSearch(e.target.value)}
              disabled={loadingRequirements}
              className="mb-2 w-full rounded-xl border px-4 py-3"
            />

            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
              {filteredRequirements.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500">
                  No requirements found
                </div>
              ) : (
                filteredRequirements.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedRequirementIds.includes(r.id)}
                      onChange={() => toggleRequirement(r.id)}
                    />
                    <span>
                      <span className="block font-medium">{r.title}</span>
                      {r.description && (
                        <span className="block text-sm text-gray-500">
                          {r.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>

            {selectedRequirementIds.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {selectedRequirementIds.length} requirement
                {selectedRequirementIds.length > 1 ? "s" : ""} selected
              </p>
            )}

            {/* inline create new requirement */}
            <div className="mt-3 rounded-xl border border-dashed p-4">
              <span className="mb-2 block text-sm font-medium text-gray-600">
                Can't find it? Add a new requirement
              </span>

              {requirementCreateError && (
                <div className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700">
                  {requirementCreateError}
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title (e.g. National ID)"
                  value={newRequirement.title}
                  onChange={(e) =>
                    setNewRequirement((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newRequirement.description}
                  onChange={(e) =>
                    setNewRequirement((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />

                <button
                  type="button"
                  onClick={handleCreateRequirement}
                  disabled={creatingRequirement}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                >
                  {creatingRequirement ? "Adding..." : "+ Add Requirement"}
                </button>
              </div>
            </div>
          </div>

          {/* Also add as a service */}
          <div className="rounded-xl border p-4">
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={addAsService}
                onChange={(e) => setAddAsService(e.target.checked)}
              />
              Also add this as a service for my company
            </label>

            {addAsService && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Service Fee (EGP)
                  </label>
                  <input
                    type="number"
                    name="company_service_fee"
                    value={serviceData.company_service_fee}
                    onChange={handleServiceChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Estimated Completion Days
                  </label>
                  <input
                    type="number"
                    name="estimated_completion_days"
                    value={serviceData.estimated_completion_days}
                    onChange={handleServiceChange}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={serviceData.is_available}
                    onChange={handleServiceChange}
                  />
                  Available
                </label>
              </div>
            )}
          </div>

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
