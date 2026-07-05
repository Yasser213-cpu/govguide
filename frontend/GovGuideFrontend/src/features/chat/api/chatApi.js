import axiosClient from "../../../api/axiosClient";

// ── Conversations ─────────────────────────────────────

/**
 * GET /api/v1/chat/conversations/
 */
export const getConversations = () =>
  axiosClient.get("/api/v1/chat/conversations/");

/**
 * POST /api/v1/chat/conversations/
 * Body: { company }
 */
export const createConversation = (companyId) =>
  axiosClient.post("/api/v1/chat/conversations/", {
    company_id: companyId,
  });

// ── Messages ──────────────────────────────────────────

/**
 * GET /api/v1/chat/conversations/:id/messages/
 */
export const getMessages = (conversationId) =>
  axiosClient.get(`/api/v1/chat/conversations/${conversationId}/messages/`);

/**
 * POST /api/v1/chat/conversations/:id/messages/
 */
export const sendChatMessage = (conversationId, content) =>
  axiosClient.post(`/api/v1/chat/conversations/${conversationId}/messages/`, {
    content,
  });

/**
 * POST /api/v1/chat/conversations/:id/read/
 */
export const markAsRead = (conversationId) =>
  axiosClient.post(`/api/v1/chat/conversations/${conversationId}/read/`);
