import axiosClient from "./axiosClient";

// ── Companies ─────────────────────────────────────────────

/**
 * GET api/v1/companies/  — public, paginated
 * Filters: name, governorate, city
 */
export const getCompanies = (params = {}) =>
  axiosClient.get("/api/v1/companies/", { params });

/**
 * GET api/v1/companies/:id/  — public
 */
export const getCompany = (id) => axiosClient.get(`/api/v1/companies/${id}`);

/**
 * POST api/v1/companies/  — company role required
 * Body: { name, description, phone, governorate, city, street }
 */
export const createCompany = (data) =>
  axiosClient.post("api/v1/companies/", data);

/**
 * PATCH api/v1/companies/:id/  — owner only
 */
export const updateCompany = (id, data) =>
  axiosClient.patch(`api/v1/companies/${id}/`, data);

/**
 * DELETE api/v1/companies/:id/  — owner only
 */
export const deleteCompany = (id) =>
  axiosClient.delete(`api/v1/companies/${id}/`);

// ── Procedures ────────────────────────────────────────────

/**
 * GET api/v1/procedures/  — auth required
 * Filters: name, description, government_authority, min_fee, max_fee, max_days
 */
export const getProcedures = (params = {}) =>
  axiosClient.get("api/v1/procedures/", { params });

// ── Company Services ──────────────────────────────────────

/**
 * GET api/v1/services/  — public, paginated
 * Filters: procedure, company, price_min, price_max, days_min, days_max, is_available
 */
export const getServices = (params = {}) =>
  axiosClient.get("api/v1/services/", { params });

/**
 * POST api/v1/services/  — company owner
 * Body: { procedure, company_service_fee, estimated_completion_days, is_available }
 */
export const createService = (data) =>
  axiosClient.post("api/v1/services/", data);

/**
 * PATCH api/v1/services/:id/
 */
export const updateService = (id, data) =>
  axiosClient.patch(`api/v1/services/${id}/`, data);

/**
 * DELETE api/v1/services/:id/
 */
export const deleteService = (id) =>
  axiosClient.delete(`api/v1/services/${id}/`);


// GET/POST company Stripe connect status
export const getCompanyStripeStatus = () =>
  axiosClient.get("/api/v1/companies/stripe/status/");

export const startStripeOnboarding = () =>
  axiosClient.post("/api/v1/companies/stripe/onboarding/");

export const getCompanyBalance = () =>
  axiosClient.get("/api/v1/companies/balance/");