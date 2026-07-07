import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getConversations,
  getMessages,
  markAsRead,
} from "../../features/chat/api/chatApi";
import {
  connectChat,
  disconnectChat,
  sendMessage,
} from "../../features/chat/chatSocket";
import { jwtDecode } from "jwt-decode";
import PageHeader from "../../components/layout/PageHeader";
import { FiSend } from "react-icons/fi";
import { usePageLoading } from "../../context/PageLoadingContext";

export default function UserMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [firstUnreadId, setFirstUnreadId] = useState(null);
  const [search, setSearch] = useState("");

  const token = sessionStorage.getItem("access");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?.user_id || decoded?.id;
  const { t } = useTranslation();
  const endRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const initialConversationHandled = useRef(false);

  const loadConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation) => {
    try {
      setMessagesLoading(true);
      setFirstUnreadId(null);

      const { data } = await getMessages(conversation.id);

      setMessages(data);

      const firstUnread = data.find(
        (message) => !message.is_me && !message.is_read,
      );
      setFirstUnreadId(firstUnread ? firstUnread.id : null);

      setSelectedConversation(conversation);

      setMessagesLoading(false);

      requestAnimationFrame(scrollToBottom);

      await markAsRead(conversation.id);
      await loadConversations();
    } catch (error) {
      console.error(error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();

    if (!selectedConversation || !draft.trim() || sending) return;

    const content = draft.trim();
    setDraft("");
    setSending(true);

    try {
      setFirstUnreadId(null); // ✅ اختفاء الفاصل بمجرد ما ترد

      sendMessage(content);

      // ✅ IMPORTANT: اعتبرها read لما تبعت
      await markAsRead(selectedConversation.id);

      // أو تحديث UI فورًا
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch (error) {
      console.error(error);
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (!messagesContainerRef.current) return;

      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    });
  };

  useLayoutEffect(() => {
    if (!messagesContainerRef.current) return;

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    loadConversations();

    return () => {
      disconnectChat();
    };
  }, []);

  useEffect(() => {
    if (initialConversationHandled.current) return;
    if (loading || conversations.length === 0) return;

    const targetId = location.state?.conversationId;
    if (!targetId) return;

    const target = conversations.find((c) => c.id === targetId);

    if (target) {
      initialConversationHandled.current = true;
      loadMessages(target);
      window.history.replaceState({}, document.title);
    }
  }, [loading, conversations, location.state]);

  useEffect(() => {
    if (!selectedConversation) return;

    disconnectChat();

    const socket = connectChat(selectedConversation.id, (payload) => {
      const incoming = {
        id: payload.message_id,
        sender: payload.sender_id,
        sender_name: payload.sender_name,
        content: payload.message,
        is_read: payload.is_read,
        created_at: payload.created_at,
        is_me: Number(payload.sender_id) === Number(currentUserId),
      };

      setMessages((prev) => {
        if (prev.some((item) => item.id === incoming.id)) return prev;
        return [...prev, incoming];
      });

      loadConversations();

      if (Number(payload.sender_id) !== Number(currentUserId)) {
        markAsRead(selectedConversation.id);
      }
    });

    return () => socket?.close();
  }, [selectedConversation?.id, currentUserId]);

  const filteredConversations = conversations.filter((conversation) =>
    (conversation.display_name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title={t("pages.messages.title")}
        subtitle={t("pages.messages.subtitle")}
      />

      <div className="h-[75vh] rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[350px_minmax(0,1fr)]">
          <div className="border-r border-slate-200 bg-slate-50 p-5 flex min-h-0 flex-col">
            <div className="mb-5">
              <label className="sr-only" htmlFor="conversation-search">
                Search conversations
              </label>
              <input
                id="conversation-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {loading ? (
                <div className="p-5 text-sm text-slate-500 text-center">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className=" p-5 text-sm text-slate-500 text-center">
                  No conversations yet.
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const active = selectedConversation?.id === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        if (selectedConversation?.id === conversation.id)
                          return;
                        loadMessages(conversation);
                      }}
                      className={`group w-full border-b border-slate-200 px-3 py-3 text-left transition ${
                        active ? "bg-sky-100" : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {conversation.company_logo ? (
                            <img
                              src={conversation.company_logo}
                              alt={conversation.display_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            conversation.display_name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* الاسم + الوقت */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-slate-900">
                              {conversation.display_name}
                            </p>

                            <span className="shrink-0 text-xs text-slate-400">
                              {conversation.last_message_time
                                ? new Date(
                                    conversation.last_message_time,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          {/* آخر رسالة + unread */}
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="truncate text-sm text-slate-500">
                              {conversation.last_message || "No messages yet."}
                            </p>

                            {conversation.unread_count > 0 && (
                              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-slate-50">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              {selectedConversation ? (
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/user/companies/${selectedConversation.company}`)
                  }
                  className="flex w-fit cursor-pointer items-center gap-4 transition hover:opacity-80"
                >
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-blue-600 text-xl font-semibold text-white shadow-sm">
                    {selectedConversation.company_logo ? (
                      <img
                        src={selectedConversation.company_logo}
                        alt={selectedConversation.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      selectedConversation.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900 hover:underline">
                      {selectedConversation.display_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Active now</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Select a conversation to start chatting.
                </div>
              )}
            </div>

            <div
              ref={messagesContainerRef}
              className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >
              {!selectedConversation ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Select a conversation.
                </div>
              ) : messagesLoading ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Loading messages...
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id}>
                    {message.id === firstUnreadId && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-blue-200" />
                        <span className="text-xs font-semibold text-blue-600">
                          New Messages
                        </span>
                        <div className="h-px flex-1 bg-blue-200" />
                      </div>
                    )}

                    <div
                      className={`flex ${message.is_me ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${message.is_me ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`rounded-[1.75rem] border px-4 py-3 text-sm leading-6 shadow-sm ${
                            message.is_me
                              ? "bg-blue-600 text-white border-transparent rounded-tr-[1.75rem] rounded-tl-[1.75rem] rounded-bl-[1.75rem]"
                              : "bg-white text-slate-900 border border-slate-200 rounded-tr-[1.75rem] rounded-tl-[1.75rem] rounded-br-[1.75rem]"
                          }`}
                        >
                          {message.content}
                        </div>
                        <span
                          className={`mt-2 text-[11px] ${message.is_me ? "text-right text-slate-400" : "text-left text-slate-400"}`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {selectedConversation && (
              <form
                onSubmit={handleSend}
                className="border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 shadow-sm">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiSend />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
