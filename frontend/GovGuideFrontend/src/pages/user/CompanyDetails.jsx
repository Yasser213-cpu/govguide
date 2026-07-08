import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getCompany } from "../../api/companyApi";
import { getProcedureById } from "../../features/ai-chat/api/Procedureapi";
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiClock,
  FiBriefcase,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiMessageCircle,
} from "react-icons/fi";

import PageHeader from "../../components/layout/PageHeader";
import ContactCompanyModal from "./Contactcompanymodal";
import { usePageLoading } from "../../context/PageLoadingContext";
import { createConversation } from "../../features/chat/api/chatApi";
import Toast from "../../components/ui/Toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function CompanyDetails() {
  useDocumentTitle("Company Details");
  const { id, procedureId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  usePageLoading(loading);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  // Toast state — moved up here with the other hooks so it's always
  // called before any early return (Rules of Hooks).
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Requirements for the currently-selected service's procedure.
  // Fetched lazily (only once a service is known) from GET /procedures/{id}.
  const [requirements, setRequirements] = useState([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [requirementsError, setRequirementsError] = useState("");

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await getCompany(id);
        setCompany(res.data);
      } catch (err) {
        setError("Failed to load company.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  const services = company?.company_services || [];

  const minFee = useMemo(() => {
    if (!services.length) return null;
    return Math.min(...services.map((s) => Number(s.company_service_fee || 0)));
  }, [services]);

  const minDays = useMemo(() => {
    if (!services.length) return null;
    return Math.min(
      ...services.map((s) => Number(s.estimated_completion_days || 0)),
    );
  }, [services]);

  const availableServices = services.filter((s) => s.is_available);

  const matchedService = useMemo(() => {
    if (!procedureId || !services.length) return null;
    return (
      services.find(
        (s) =>
          String(s.procedure) === String(procedureId) ||
          String(s.company_offerings?.id) === String(procedureId),
      ) || null
    );
  }, [procedureId, services]);

  // If the route already gives us a matched service (procedure route),
  // fetch its requirements right away so the modal opens ready-to-go.
  useEffect(() => {
    const procedureIdToFetch =
      matchedService?.procedure || matchedService?.company_offerings?.id;
    if (procedureIdToFetch) {
      fetchRequirements(procedureIdToFetch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedService?.procedure, matchedService?.company_offerings?.id]);

  async function fetchRequirements(procedureId) {
    if (!procedureId) {
      setRequirements([]);
      return;
    }
    setRequirementsLoading(true);
    setRequirementsError("");
    try {
      const procedure = await getProcedureById(procedureId);
      // Backend returns { id, title, ... } — map to the { id, name }
      // shape the modal renders.
      const mapped = (procedure.requirements || []).map((r) => ({
        id: r.id,
        name: r.title,
      }));
      setRequirements(mapped);
    } catch (err) {
      setRequirementsError(
        "Couldn't load required documents for this service.",
      );
      setRequirements([]);
    } finally {
      setRequirementsLoading(false);
    }
  }

  // Called by the modal once the user picks a service in Step 1
  // (the no-procedureId flow), so we can fetch its requirements too.
  const handleServiceSelected = (service) => {
    const procedureIdToFetch =
      service?.procedure || service?.company_offerings?.id;
    if (procedureIdToFetch) {
      fetchRequirements(procedureIdToFetch);
    } else {
      setRequirements([]);
    }
  };

  // If we have a procedureId, we pre-match the service.
  // If not, the modal handles service selection itself.
  const canContact = availableServices.length > 0;

  const handleStartChat = async () => {
    if (!company?.id) return;

    try {
      setStartingChat(true);
      const { data } = await createConversation(company.id);
      navigate("/user/messages", { state: { conversationId: data.id } });
    } catch (error) {
      console.error(error);
    } finally {
      setStartingChat(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">{error}</div>
    );
  }

  if (!company) {
    return null;
  }

  const logoUrl = company.logo ? `http://127.0.0.1:8000${company.logo}` : null;

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle={`${company.governorate}${company.city ? `, ${company.city}` : ""}`}
      />

      <button
        onClick={() => navigate("/user/companies")}
        className="mb-6 flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
      >
        <FiArrowLeft />
        Back to Companies
      </button>

      <div>
        {/* Header */}
        <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* Left */}
            <div className="flex gap-6">
              <div className="h-28 w-28 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={company.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-xl font-bold text-[var(--primary)]">
                    {company.name?.[0]}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {company.name}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <FiStar
                    size={18}
                    className={`${
                      company.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                  <span className="font-semibold text-[var(--text-primary)]">
                    {company.rating ? Number(company.rating).toFixed(1) : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 text-[var(--text-secondary)]">
                  <FiMapPin />
                  {company.governorate}
                  {company.city && `, ${company.city}`}
                </div>

                <p className="mt-5 max-w-2xl text-[var(--text-secondary)] leading-7">
                  {company.description || "No description available."}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsContactOpen(true)}
                  disabled={!canContact}
                  title={
                    canContact
                      ? undefined
                      : "This company has no available services."
                  }
                  className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                >
                  Ask for a Service
                </button>

                <button
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--primary)] text-[var(--primary)] font-semibold hover:bg-[var(--primary-light)] disabled:opacity-50"
                >
                  <FiMessageCircle />
                  {startingChat ? "Opening chat..." : "Contact Company"}
                </button>
              </div>

              {company.phone && (
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <FiPhone />
                  {company.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <FiBriefcase size={22} className="text-[var(--primary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Services</p>
            <h2 className="text-3xl font-bold mt-2">{services.length}</h2>
          </div>

          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <FiDollarSign size={22} className="text-[var(--primary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              Starting From
            </p>
            <h2 className="text-3xl font-bold mt-2">
              {minFee ? `${minFee} EGP` : "--"}
            </h2>
          </div>

          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <FiClock size={22} className="text-[var(--primary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              Fastest Service
            </p>
            <h2 className="text-3xl font-bold mt-2">
              {minDays ? `${minDays} Days` : "--"}
            </h2>
          </div>

          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <FiCheckCircle size={22} className="text-green-500 mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Available</p>
            <h2 className="text-3xl font-bold mt-2">
              {availableServices.length}
            </h2>
          </div>
        </div>

        {/* About & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              About Company
            </h2>
            <p className="leading-8 text-[var(--text-secondary)]">
              {company.description ||
                "No company description has been provided yet."}
            </p>
          </div>

          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
              Contact Information
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-[var(--primary)] mt-1" size={18} />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {company.governorate}
                    {company.city && `, ${company.city}`}
                    {company.street && `, ${company.street}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiPhone className="text-[var(--primary)] mt-1" size={18} />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {company.phone || "Not Available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Services</h2>
            <span className="text-sm text-[var(--text-secondary)]">
              {services.length} Services
            </span>
          </div>

          {services.length === 0 ? (
            <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-10 text-center">
              <FiAlertCircle
                size={40}
                className="mx-auto mb-4 text-[var(--text-secondary)]"
              />
              <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
              <p className="text-[var(--text-secondary)]">
                This company hasn't added any services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--primary)] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">
                        {service.company_offerings?.name ||
                          "Government Service"}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {service.company_offerings?.description ||
                          "Professional government paperwork service."}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Service Fee
                      </p>
                      <p className="font-bold text-lg">
                        {service.company_service_fee} EGP
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Estimated Time
                      </p>
                      <p className="font-bold text-lg">
                        {service.estimated_completion_days} Days
                      </p>
                    </div>
                  </div>

                  {service.is_available && (
                    <button
                      onClick={() => {
                        setIsContactOpen(true);
                      }}
                      className="mt-4 w-full py-2 rounded-lg border border-[var(--primary)] text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary-light)] transition"
                    >
                      Request This Service
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Total Services
                </span>
                <span className="font-semibold">{services.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Available Services
                </span>
                <span className="font-semibold text-green-600">
                  {availableServices.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Starting Price
                </span>
                <span className="font-semibold">
                  {minFee ? `${minFee} EGP` : "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Fastest Completion
                </span>
                <span className="font-semibold">
                  {minDays ? `${minDays} Days` : "--"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-primary)] rounded-xl border border-[var(--border)] p-6 flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-3">Need a Service?</h2>
            <p className="text-[var(--text-secondary)] leading-7 mb-6">
              Browse the available services above and choose the one that best
              fits your needs. Click "Contact Company" to start a request.
            </p>
            <button
              onClick={() => navigate("/user/companies")}
              className="w-fit px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>

      <ContactCompanyModal
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        // If we have a pre-matched service (came from procedure route), pass it directly.
        // Otherwise pass null and let the modal show the service picker.
        preSelectedService={matchedService ?? null}
        availableServices={availableServices}
        requirements={requirements}
        requirementsLoading={requirementsLoading}
        requirementsError={requirementsError}
        onServiceSelected={handleServiceSelected}
        onSuccess={(order) => {
          setSubmittedOrder(order);
          setIsContactOpen(false);
          setToast({
            show: true,
            message: `Your request has been submitted (Order #${order.id}). The company will review it shortly.`,
            type: "success",
          });
        }}
      />
    </>
  );
}
