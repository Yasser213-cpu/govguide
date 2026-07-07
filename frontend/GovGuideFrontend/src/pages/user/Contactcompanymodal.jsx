import { useState } from "react";
import {
  FiX,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiChevronRight,
  FiArrowLeft,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import {
  createOrder,
  uploadOrderDocument,
} from "../../features/orders/api/Ordersapi";

/**
 * Extracts a human-readable message from an Axios/DRF error response.
 *
 * DRF ValidationErrors come back in different shapes depending on where
 * they're raised:
 *   - Non-field errors:      { detail: "..." }
 *   - Custom message key:    { message: "..." }
 *   - Field-level errors:    { service: ["You already have an active order..."] }
 *                            { notes: ["This field may not be blank."], ... }
 *
 * This walks all three shapes so field errors (like the duplicate-order
 * check in OrderCreateSerializer.validate) actually reach the user instead
 * of falling back to a generic message.
 */
function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (!data) return fallback;

  if (typeof data === "string") return data;

  if (data.detail) return data.detail;
  if (data.message) return data.message;

  // Field-level DRF errors: { field: ["msg", ...], ... }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    const msg = Array.isArray(value) ? value[0] : value;
    if (typeof msg === "string") return msg;
  }

  return fallback;
}

/**
 * ContactCompanyModal
 *
 * Two entry modes:
 *
 * A) Pre-matched service (came from a procedure route):
 *    Pass `preSelectedService` — the modal skips straight to the upload/notes step.
 *
 * B) No procedure context (generic company page):
 *    Pass `availableServices` — the modal shows a service picker as Step 1,
 *    then advances to upload/notes once the user picks one.
 *
 * Flow:
 *  Step 1 (service picker) — only shown when preSelectedService is null
 *  Step 2 (upload + notes) — user fills notes, uploads files per requirement
 *  Step 3 — POST /orders/ → POST /orders/{id}/documents sequentially
 *
 * Props:
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {{ id: number, procedure?: number, company_offerings?: { name, description }, company_service_fee, estimated_completion_days } | null} preSelectedService
 * @param {Array} availableServices  — used for the picker when preSelectedService is null
 * @param {Array<{id: number, name: string}>} [requirements]  — requirement list for the procedure (parent maps API's `title` -> `name`)
 * @param {boolean} [requirementsLoading]  — true while the parent is fetching requirements for the selected service
 * @param {string} [requirementsError]  — error message if the requirements fetch failed
 * @param {(service: object) => void} [onServiceSelected]  — called when the user picks a service in Step 1, so the parent can fetch its requirements
 * @param {(order: object) => void} [onSuccess]
 */
export default function ContactCompanyModal({
  open,
  onClose,
  preSelectedService,
  availableServices = [],
  requirements,
  requirementsLoading = false,
  requirementsError = "",
  onServiceSelected,
  onSuccess,
}) {
  // Step: "pick" | "form"
  const [step, setStep] = useState(preSelectedService ? "form" : "pick");
  const [selectedService, setSelectedService] = useState(
    preSelectedService ?? null,
  );

  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileErrors, setFileErrors] = useState({});
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const requirementList =
    requirements && requirements.length > 0
      ? requirements
      : [{ id: null, name: "Supporting Document" }];

  if (!open) return null;

  const handleFileChange = (reqKey, file) => {
    setFiles((prev) => ({ ...prev, [reqKey]: file }));
    setFileErrors((prev) => ({ ...prev, [reqKey]: undefined }));
  };

  const resetState = () => {
    setStep(preSelectedService ? "form" : "pick");
    setSelectedService(preSelectedService ?? null);
    setNotes("");
    setFiles({});
    setError("");
    setFileErrors({});
    setCreatedOrderId(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetState();
    onClose?.();
  };

  const handlePickService = (service) => {
    setSelectedService(service);
    setStep("form");
    onServiceSelected?.(service);
  };

  const handleBack = () => {
    if (submitting) return;
    setStep("pick");
    setSelectedService(null);
    setError("");
    setFileErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedService?.id) {
      setError("No service selected — please go back and pick a service.");
      return;
    }

    // ── Client-side guard: every requirement needs a file before we submit ──
    // This runs before the order is even created, so we never end up with an
    // order that has no documents attached because of a client oversight.
    // (Retries after a partial upload failure skip this — createdOrderId
    // means the order already exists and we're just retrying failed files.)
    if (!createdOrderId) {
      const missing = {};
      for (const req of requirementList) {
        const reqKey = req.id ?? "generic";
        if (!files[reqKey]) {
          missing[reqKey] = "This document is required.";
        }
      }

      if (Object.keys(missing).length > 0) {
        setFileErrors(missing);
        setError("Please upload all required documents before submitting.");
        return;
      }
    }

    setSubmitting(true);

    let orderId = createdOrderId;

    try {
      // Step 1: create order (idempotent on retry)
      if (!orderId) {
        try {
          const order = await createOrder({
            service: selectedService.id,
            notes,
          });

          if (!order.id) {
            setError(
              "Order was created but no order ID was returned. Documents can't be uploaded automatically — please contact support.",
            );
            setSubmitting(false);
            return;
          }

          orderId = order.id;
          setCreatedOrderId(orderId);
        } catch (err) {
          // Surfaces backend validation errors, e.g. the duplicate-order
          // check in OrderCreateSerializer.validate:
          //   {"service": "You already have an active order for this service."}
          setError(
            getErrorMessage(
              err,
              "Failed to submit your request. Please try again.",
            ),
          );
          setSubmitting(false);
          return;
        }
      }

      // Step 2: upload each requirement file
      const newFileErrors = {};

      for (const req of requirementList) {
        const reqKey = req.id ?? "generic";
        const file = files[reqKey];

        if (!file) continue;

        if (req.id == null) {
          newFileErrors[reqKey] =
            "No requirement ID configured for this upload slot.";
          continue;
        }

        try {
          await uploadOrderDocument(orderId, req.id, file);
        } catch (err) {
          newFileErrors[reqKey] = getErrorMessage(
            err,
            "Upload failed for this file.",
          );
        }
      }

      if (Object.keys(newFileErrors).length > 0) {
        setFileErrors(newFileErrors);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      onSuccess?.({ id: orderId });
      resetState();
      onClose?.();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to submit your request. Please try again.",
        ),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--background-primary)] border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {step === "form" && !preSelectedService && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
              >
                <FiArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {step === "pick" ? "Choose a Service" : "Submit Request"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Step indicator */}
        {!preSelectedService && (
          <div className="flex items-center gap-2 mb-5">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                step === "pick"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--primary-light)] text-[var(--primary)]"
              }`}
            >
              <span>1</span>
              <span>Select Service</span>
            </div>
            <FiChevronRight
              size={14}
              className="text-[var(--text-secondary)]"
            />
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                step === "form"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              <span>2</span>
              <span>Upload &amp; Submit</span>
            </div>
          </div>
        )}

        {/* ── STEP 1: Service Picker ── */}
        {step === "pick" && (
          <div className="space-y-3">
            {availableServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiAlertCircle
                  size={36}
                  className="text-[var(--text-secondary)] mb-3"
                />
                <p className="text-[var(--text-secondary)] text-sm">
                  No available services at the moment.
                </p>
              </div>
            ) : (
              availableServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handlePickService(service)}
                  className="w-full text-left rounded-xl border border-[var(--border)] p-4 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                        {service.company_offerings?.name ||
                          "Government Service"}
                      </p>
                      {service.company_offerings?.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                          {service.company_offerings.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <FiDollarSign size={12} />
                          {service.company_service_fee} EGP
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <FiClock size={12} />
                          {service.estimated_completion_days} days
                        </span>
                      </div>
                    </div>
                    <FiChevronRight
                      size={18}
                      className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] shrink-0"
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* ── STEP 2: Upload & Notes Form ── */}
        {step === "form" && (
          <>
            {/* Selected service summary */}
            {selectedService && (
              <div className="mb-4 rounded-xl bg-[var(--primary-light)] border border-[var(--primary)]/20 px-4 py-3">
                <p className="text-xs text-[var(--primary)] font-medium mb-0.5">
                  Selected Service
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedService.company_offerings?.name ||
                    "Government Service"}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <FiDollarSign size={11} />
                    {selectedService.company_service_fee} EGP
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <FiClock size={11} />
                    {selectedService.estimated_completion_days} days
                  </span>
                </div>
              </div>
            )}

            {createdOrderId && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 text-blue-700 px-4 py-3 text-sm">
                <FiCheckCircle />
                Order #{createdOrderId} created. Retry any failed uploads below.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Notes{" "}
                  <span className="text-[var(--text-secondary)]">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting && !!createdOrderId}
                  rows={3}
                  placeholder="Anything the company should know, e.g. urgency or special requests"
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Required Documents
                </label>

                {requirementsLoading && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <FiLoader size={13} className="animate-spin" />
                    Loading required documents…
                  </div>
                )}

                {!requirementsLoading && requirementsError && (
                  <p className="mb-3 text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {requirementsError}
                  </p>
                )}

                {!requirementsLoading &&
                  !requirementsError &&
                  (!requirements || requirements.length === 0) && (
                    <p className="mb-3 text-xs text-amber-600 flex items-center gap-1">
                      <FiAlertCircle size={14} />
                      Requirement list not available yet — using a generic
                      upload.
                    </p>
                  )}

                {!requirementsLoading && (
                  <div className="space-y-3">
                    {requirementList.map((req) => {
                      const reqKey = req.id ?? "generic";
                      return (
                        <div
                          key={reqKey}
                          className={`rounded-xl border p-4 ${
                            fileErrors[reqKey]
                              ? "border-red-400"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {req.name}
                              <span className="text-red-500"> *</span>
                            </span>
                            <label className="flex items-center gap-2 text-sm text-[var(--primary)] cursor-pointer hover:underline">
                              <FiUpload size={16} />
                              {files[reqKey] ? "Change file" : "Upload file"}
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileChange(
                                    reqKey,
                                    e.target.files?.[0] || null,
                                  )
                                }
                              />
                            </label>
                          </div>

                          {files[reqKey] && (
                            <p className="mt-2 text-xs text-[var(--text-secondary)] truncate">
                              {files[reqKey].name}
                            </p>
                          )}

                          {fileErrors[reqKey] && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                              <FiAlertCircle size={14} />
                              {fileErrors[reqKey]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">
                  <FiAlertCircle />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] font-semibold text-[var(--text-primary)] disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || requirementsLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {submitting && <FiLoader className="animate-spin" />}
                  {createdOrderId ? "Retry Uploads" : "Submit Request"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
