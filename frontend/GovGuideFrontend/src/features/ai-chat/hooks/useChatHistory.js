import { useCallback, useState } from "react";
import { getChatSessions, getChatSessionMessages } from "../api/aiChatApi";

/**
 * Loads the user's past AI chat sessions on demand (lazy — only fetches
 * once `open()` is called, e.g. when the history panel is first opened),
 * and supports "load more" pagination via the `next` URL the API returns.
 */
export const useChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getChatSessions();
      setSessions(data.results || []);
      setNextUrl(data.next);
      setHasLoaded(true);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Please sign in to view your chat history."
          : "Couldn't load chat history. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await getChatSessions(nextUrl);
      setSessions((prev) => [...prev, ...(data.results || [])]);
      setNextUrl(data.next);
    } catch (err) {
      // Keep existing sessions visible; just stop pagination on failure.
      setError("Couldn't load more history.");
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  const openSession = useCallback(async (sessionId) => {
    return getChatSessionMessages(sessionId);
  }, []);

  // Only fetches on first call — reopening the panel won't refetch.
  const open = useCallback(() => {
    if (!hasLoaded && !loading) {
      load();
    }
  }, [hasLoaded, loading, load]);

  return {
    sessions,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(nextUrl),
    open,
    loadMore,
    openSession,
    refresh: load,
  };
};
