import axiosClient from "../../../api/axiosClient";

/**
 * Fetch the logged-in client's orders.
 * GET /api/v1/orders/
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   company: string,
 *   procedure: string,
 *   status: "pending"|"accepted"|"rejected"|"paid"|"in_progress"|"completed",
 *   notes: string,
 *   rejection_reason: string|null,
 *   documents: Array,
 *   created_at: string
 * }>>}
 */
export const getMyOrders = async () => {
  const response = await axiosClient.get("/api/v1/orders/");
  return response.data;
};

/**
 * Create a new order for a company service.
 * POST /api/v1/orders/
 *
 * @param {{ service: number, notes?: string }} payload
 * @returns {Promise<{ id: number|null, service: number, notes: string }>}
 *
 * NOTE: the documented 201 response only echoes back `{ service, notes }`,
 * no `id`. If the backend doesn't actually return the new order's id,
 * document upload (which needs the order id) can't proceed. We defensively
 * check `data.id` / `data.order_id` / `data.pk` and surface a clear error
 * upstream if none come back — flag this to Mohamed.
 */
export const createOrder = async ({ service, notes }) => {
  const response = await axiosClient.post("/api/v1/orders/", {
    service,
    ...(notes ? { notes } : {}),
  });

  const data = response.data || {};
  const orderId = data.id ?? data.order_id ?? data.pk ?? null;

  return { ...data, id: orderId };
};

/**
 * Upload a single requirement document for an order.
 * POST /api/v1/orders/{id}/documents
 * Only allowed while the order status is "pending".
 * Only one document per requirement is allowed.
 *
 * @param {number} orderId
 * @param {number} requirementId
 * @param {File} file
 * @returns {Promise<{ requirement: number, file: string }>}
 */
export const uploadOrderDocument = async (orderId, requirementId, file) => {
  const form = new FormData();
  form.append("requirement", requirementId);
  form.append("file", file);

  const response = await axiosClient.post(
    `/api/v1/orders/${orderId}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};