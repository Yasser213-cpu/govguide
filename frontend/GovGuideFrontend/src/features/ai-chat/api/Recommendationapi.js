import axiosClient from "../../../api/axiosClient";

/**
 * Get ranked companies that can perform a given procedure.
 * POST /api/v1/ai/recommend-companies/
 *
 * @param {number} procedureId - required
 * @param {string} [governorate] - optional, ranks same-governorate companies higher
 * @returns {Promise<{
 *   procedure_id: number,
 *   results: Array<{
 *     company_id: number,
 *     company_name: string,
 *     governorate: string,
 *     city: string,
 *     price: string,
 *     estimated_days: number,
 *     score: number
 *   }>
 * }>}
 */
export const recommendCompanies = async (procedureId, governorate) => {
  const body = governorate
    ? { procedure_id: procedureId, governorate }
    : { procedure_id: procedureId };

  const response = await axiosClient.post(
    "/api/v1/ai/recommend-companies/",
    body,
  );

  return response.data;
};