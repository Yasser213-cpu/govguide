import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiGrid,
  FiBriefcase,
  FiCalendar,
  FiSettings,
  FiBell,
  FiUser,
} from "react-icons/fi";

const companyNavItems = [
  { path: "/company/dashboard", icon: FiGrid, key: "companyDashboard" },
  { path: "/company/profile", icon: FiUser, key: "companyProfile" },
  { path: "/company/services", icon: FiBriefcase, key: "companyServices" },
  { path: "/company/bookings", icon: FiCalendar, key: "companyBookings" },
  {
    path: "/company/notifications",
    icon: FiBell,
    key: "companyNotifications",
  },
  { path: "/company/settings", icon: FiSettings, key: "companySettings" },
];

const CompanySidebar = () => {
  const { t } = useTranslation();

  return (
    <aside className="w-[260px] min-h-screen shrink-0 bg-[var(--background-primary)] border-e border-[var(--border)] flex flex-col">
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--secondary-light)] flex items-center justify-center text-[var(--secondary)] font-semibold text-sm shrink-0">
            CO
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {t("sidebar.companyName")}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("sidebar.companyRole")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CompanySidebar;
