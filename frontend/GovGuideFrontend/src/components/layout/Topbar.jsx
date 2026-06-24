import { FiBell } from "react-icons/fi";
import LanguageSwitcher from "../LanguageSwitcher";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  return (
    <header className="h-16 flex items-center justify-end px-6 gap-3 bg-[var(--background-secondary)]">
      <button
        type="button"
        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--background-primary)] transition-colors"
        aria-label="Notifications"
        onClick={() => navigate("/notifications")}
      >
        <FiBell size={20} />
      </button>
      <LanguageSwitcher />
    </header>
  );
};

export default Topbar;
