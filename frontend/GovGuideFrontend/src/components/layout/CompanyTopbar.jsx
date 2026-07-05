import { FiBell } from "react-icons/fi";
import LanguageSwitcher from "../LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import useUnreadNotificationsCount from "../../features/notifications/useUnreadNotificationsCount";

const CompanyTopbar = () => {
  const navigate = useNavigate();
  const { count } = useUnreadNotificationsCount();

  return (
    <header className="h-16 flex items-center justify-end px-6 gap-3 bg-[var(--background-secondary)]">
      <button
        type="button"
        className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--secondary)] hover:bg-[var(--background-primary)] transition-colors"
        aria-label="Notifications"
        onClick={() => navigate("/company/notifications")}
      >
        <FiBell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <LanguageSwitcher />
    </header>
  );
};

export default CompanyTopbar;
