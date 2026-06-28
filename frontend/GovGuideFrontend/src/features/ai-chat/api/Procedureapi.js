import axiosClient from "../../../api/axiosClient";

/**
 * Fetch a single procedure with its checklist of requirements + fees.
 * GET /api/v1/procedures/<id>   (no trailing slash)
 *
 * @param {number|string} procedureId
 * @returns {Promise<{
 *   id: number,
 *   name: string,
 *   description: string,
 *   estimated_government_fee: string|null,
 *   estimated_processing_days: number|null,
 *   government_authority: string,
 *   requirements: Array<{ id: number, title: string, description: string, done: boolean }>
 * }>}
 */
export const getProcedureById = async (procedureId) => {
  const response = await axiosClient.get(`/api/v1/procedures/${procedureId}`);
  return response.data;
};