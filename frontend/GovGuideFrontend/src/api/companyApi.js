import axiosClient from "./axiosClient";

// ── Companies ─────────────────────────────────────────────

/**
 * GET /api/companies/  — public, paginated
 * Filters: name, governorate, city
 */
export const getCompanies = (params = {}) =>
  axiosClient.get("/api/companies/", { params });

/**
 * GET /api/companies/:id/  — public
 */
export const getCompany = (id) =>
  axiosClient.get(`/api/companies/${id}/`);

/**
 * POST /api/companies/  — company role required
 * Body: { name, description, phone, governorate, city, street }
 */
export const createCompany = (data) =>
  axiosClient.post("/api/companies/", data);

/**
 * PATCH /api/companies/:id/  — owner only
 */
export const updateCompany = (id, data) =>
  axiosClient.patch(`/api/companies/${id}/`, data);

/**
 * DELETE /api/companies/:id/  — owner only
 */
export const deleteCompany = (id) =>
  axiosClient.delete(`/api/companies/${id}/`);

// ── Procedures ────────────────────────────────────────────

/**
 * GET /api/procedures/  — auth required
 * Filters: name, description, government_authority, min_fee, max_fee, max_days
 */
export const getProcedures = (params = {}) =>
  axiosClient.get("/api/procedures/", { params });

// ── Company Services ──────────────────────────────────────

/**
 * GET /api/services/  — public, paginated
 * Filters: procedure, company, price_min, price_max, days_min, days_max, is_available
 */
export const getServices = (params = {}) =>
  axiosClient.get("/api/services/", { params });

/**
 * POST /api/services/  — company owner
 * Body: { procedure, company_service_fee, estimated_completion_days, is_available }
 */
export const createService = (data) =>
  axiosClient.post("/api/services/", data);

/**
 * PATCH /api/services/:id/
 */
export const updateService = (id, data) =>
  axiosClient.patch(`/api/services/${id}/`, data);

/**
 * DELETE /api/services/:id/
 */
export const deleteService = (id) =>
  axiosClient.delete(`/api/services/${id}/`);