import axiosClient from "../../../api/axiosClient";

export const getMyOrders = async () => {
  const response = await axiosClient.get("/api/v1/orders/");
  return response.data;
};

export const createOrder = async ({ service, notes }) => {
  const response = await axiosClient.post("/api/v1/orders/", {
    service,
    ...(notes ? { notes } : {}),
  });
  const data = response.data || {};
  const orderId = data.id ?? data.order_id ?? data.pk ?? null;
  return { ...data, id: orderId };
};

export const uploadOrderDocument = async (orderId, requirementId, file) => {
  const form = new FormData();
  form.append("requirement", requirementId);
  form.append("file", file);
  const response = await axiosClient.post(
    `/api/v1/orders/${orderId}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/**
 * Mark an accepted order as paid.
 * POST /api/v1/orders/{id}/pay
 * Only valid when order status is "accepted".
 *
 * @param {number} orderId
 * @returns {Promise<{ message: string, status: "paid" }>}
 */
export const payOrder = async (orderId) => {
  const response = await axiosClient.post(`/api/v1/orders/${orderId}/pay`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axiosClient.get(`/api/v1/orders/${orderId}`);
  return response.data;
};


