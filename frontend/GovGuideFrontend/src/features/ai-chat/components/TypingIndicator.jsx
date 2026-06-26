// import { FiCpu } from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";

const TypingIndicator = () => {
  return (
    <div className="mb-6 flex items-end gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)]">
        <BsBank2 size={18} className="text-red-500" />{" "}
      </div>

      <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--background-secondary)] px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]"></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]"
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]"
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
