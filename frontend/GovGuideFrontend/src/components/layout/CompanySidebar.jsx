import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  FiGrid,
  FiBriefcase,
  FiCalendar,
  FiSettings,
  FiBell,
  FiUser,
  FiLogOut,
  FiFileText,
  FiMail,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import { useCompany } from "../../context/CompanyContext";

const companyNavItems = [
  { path: "/company/dashboard", icon: FiGrid, key: "companyDashboard" },
  { path: "/company/profile", icon: FiUser, key: "companyProfile" },
  { path: "/company/services", icon: FiBriefcase, key: "companyServices" },
  { path: "/company/orders", icon: FiFileText, key: "companyOrders" },
  { path: "/company/bookings", icon: FiCalendar, key: "companyBookings" },
  { path: "/company/messages", icon: FiMail, key: "companyMessages" },
  {
    path: "/company/notifications",
    icon: FiBell,
    key: "companyNotifications",
  },
  { path: "/company/settings", icon: FiSettings, key: "companySettings" },
];

const CompanySidebar = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { company, loading } = useCompany();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="
    fixed
    top-0
    start-0
    z-50
    h-screen
    w-[260px]
    bg-[var(--background-primary)]
    border-e
    border-[var(--border)]
    flex
    flex-col
  "
    >
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
          {t("common.appNameAr")} - {t("common.company")}
        </p>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {companyNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--secondary-light)] text-[var(--secondary)] border-s-4 border-[var(--secondary)]"
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
          <div
            className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[var(--secondary-light)]
            text-[var(--secondary)]
          "
          >
            <BsBank2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {loading
                ? "Loading..."
                : company?.name || t("sidebar.companyName")}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("sidebar.companyRole")}
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

export default CompanySidebar;
