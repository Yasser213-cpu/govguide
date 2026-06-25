import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiGrid, FiUsers, FiBriefcase, FiBarChart } from "react-icons/fi";

const adminNavItems = [
  { path: "/admin/dashboard", icon: FiGrid, key: "adminDashboard" },
  { path: "/admin/users", icon: FiUsers, key: "adminUsers" },
  { path: "/admin/companies", icon: FiBriefcase, key: "adminCompanies" },
  { path: "/admin/reports", icon: FiBarChart, key: "adminReports" },
];

const AdminSidebar = () => {
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
          {t("common.appNameAr")} - {t("common.admin")}
        </p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--danger-light)] text-[var(--danger)] border-s-4 border-[var(--danger)]"
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
          <div className="w-10 h-10 rounded-full bg-[var(--danger-light)] flex items-center justify-center text-[var(--danger)] font-semibold text-sm shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {t("sidebar.adminName")}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("sidebar.adminRole")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
