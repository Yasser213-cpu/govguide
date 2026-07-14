import axiosClient from "../../../api/axiosClient";

export const getMyOrders = async () => {
  const response = await axiosClient.get("/api/v1/orders/");
  return response.data;
};

export const getCompanyOrders = async () => {
  const response = await axiosClient.get("/api/v1/company/orders/");
  return response.data;
};

export const getCompanyOrder = async (orderId) => {
  const response = await axiosClient.get(`/api/v1/company/orders/${orderId}/`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosClient.patch(
    `/api/v1/orders/${orderId}/status/`,
    {
      status,
    },
  );
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
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

/**
 * Create a Stripe Checkout Session for an accepted order.
 * POST /api/v1/orders/{id}/create-checkout-session/
 *
 * @param {number} orderId
 * @returns {Promise<{ checkout_url: string }>}
 */
export const createCheckoutSession = async (orderId) => {
  const response = await axiosClient.post(
    `/api/v1/orders/${orderId}/create-checkout-session/`,
  );
  return response.data;
};

/**
 * Verify Stripe payment after redirect and sync order status.
 * POST /api/v1/orders/{id}/verify-payment/
 */
export const verifyPayment = async (orderId) => {
  const response = await axiosClient.post(
    `/api/v1/orders/${orderId}/verify-payment/`,
  );
  return response.data;
};

/**
 * @deprecated Use createCheckoutSession for Stripe payments.
 */
export const payOrder = async (orderId) => {
  const response = await axiosClient.post(`/api/v1/orders/${orderId}/pay`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axiosClient.get(`/api/v1/orders/${orderId}`);
  return response.data;
};

export const submitReview = async (orderId, reviewData) => {
  const response = await axiosClient.post(
    `/api/v1/orders/${orderId}/review`,
    reviewData,
  );

  return response.data;
};
