import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { navItems } from "./navConfig";
import { FiLogOut } from "react-icons/fi";
import { useUser } from "../../context/UserContext";

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useUser();

  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  const fullName =
    user?.first_name && user?.last_name
      ? `${capitalize(user.first_name)} ${capitalize(user.last_name)}`
      : capitalize(user?.username || "");

  const initials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : (user?.username?.[0] || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-[260px] h-screen shrink-0 bg-[var(--background-primary)] border-e border-[var(--border)] flex flex-col">
      {" "}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo-full.png"
            alt="GovConnect AI"
            className="h-10 w-auto object-contain"
          />
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {t("common.appNameAr")} - {t("common.user")}
        </p>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary)] border-s-4 border-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--text-primary)]"
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span>{t(`nav.${item.key}`)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-5 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {fullName}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("sidebar.userRole")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="
          group
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--background-primary)]
          px-4
          py-3
          text-sm
          font-semibold
          text-[var(--text-primary)]
          shadow-sm
          transition-all
          duration-200
          hover:border-red-400
          hover:bg-red-50
          hover:text-red-600
          active:scale-95
        "
        >
          <FiLogOut
            size={18}
            className={`transition-transform duration-200 ${
              isRTL ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"
            }`}
          />

          <span>{t("auth.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
