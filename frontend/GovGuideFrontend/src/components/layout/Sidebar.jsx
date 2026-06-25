import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { navItems } from "./navConfig";

const Sidebar = () => {
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-semibold text-sm shrink-0">
            AM
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {t("sidebar.userName")}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("sidebar.userRole")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
