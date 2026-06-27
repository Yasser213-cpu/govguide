import { FiUser } from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import ProcedureChecklist from "./ProcedureChecklist";
import CompanyRecommendations from "./CompanyRecommendations";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`mb-6 flex items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)]">
          <BsBank2 size={18} className="text-[var(--primary)]" />
        </div>
      )}

      {/* Message */}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm whitespace-pre-wrap break-words
          ${
            isUser
              ? "rounded-br-md bg-[var(--primary)] text-white"
              : "rounded-bl-md border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-primary)]"
          }`}
      >
        {!isUser && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            GovGuide Assistant
          </p>
        )}

        <p className="text-sm leading-7">{message.text}</p>

        {/* Checklist + fees (only present once GET /procedures/<id> resolves) */}
        {!isUser && message.procedure && (
          <ProcedureChecklist procedure={message.procedure} />
        )}

        {/* Ranked companies (only present once recommend-companies resolves) */}
        {!isUser && message.companies && (
          <CompanyRecommendations results={message.companies} />
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
          <FiUser size={18} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;