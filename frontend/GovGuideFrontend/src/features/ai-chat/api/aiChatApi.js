import axiosClient from "../../../api/axiosClient";

/**
 * Send a message to the AI chat endpoint.
 * POST /api/v1/ai/chat/
 *
 * @param {string} message - the user's message text.
 * @param {string|null} [sessionId] - existing conversation session id, or
 *   omit/null to start a new conversation.
 * @returns {Promise<{
 *   intent: string,
 *   answer: string,
 *   tokens: number,
 *   procedure_id: number|null,
 *   session_id: string
 * }>}
 */
export const sendMessage = async (message, sessionId = null) => {
  const body = { message };
  if (sessionId) {
    body.session_id = sessionId;
  }

  const response = await axiosClient.post("/api/v1/ai/chat/", body);

  return response.data;
};

/**
 * Fetch the logged-in user's past chat sessions (grouped conversations).
 * GET /api/v1/ai/chat-history/  (paginated, newest first)
 *
 * @param {string} [url] - full URL to fetch (used for pagination via `next`).
 *   Defaults to the first page.
 * @returns {Promise<{
 *   count: number,
 *   next: string|null,
 *   previous: string|null,
 *   results: Array<{
 *     session_id: string,
 *     preview: string,
 *     message_count: number,
 *     started_at: string,
 *     last_message_at: string
 *   }>
 * }>}
 */
export const getChatSessions = async (url = "/api/v1/ai/chat-history/") => {
  const response = await axiosClient.get(url);
  return response.data;
};

/**
 * Fetch all messages in a single chat session, oldest first.
 * GET /api/v1/ai/chat-history/<session_id>/
 *
 * @param {string} sessionId - the conversation session id.
 * @returns {Promise<Array<{
 *   id: number,
 *   message: string,
 *   answer: string,
 *   intent: string,
 *   procedure_id: number|null,
 *   tokens_used: number,
 *   created_at: string
 * }>>}
 */
export const getChatSessionMessages = async (sessionId) => {
  const response = await axiosClient.get(
    `/api/v1/ai/chat-history/${sessionId}/`,
  );
  return response.data;
};
