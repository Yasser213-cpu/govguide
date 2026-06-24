import {
  FiGrid,
  FiMessageCircle,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiFolder,
  FiMail,
  FiBell,
  FiSettings,
} from "react-icons/fi";

export const navItems = [
  { path: "/user/dashboard", icon: FiGrid, key: "dashboard" },
  { path: "/user/ai-assistant", icon: FiMessageCircle, key: "aiAssistant" },
  { path: "/user/companies", icon: FiBriefcase, key: "companies" },
  { path: "/user/my-requests", icon: FiFileText, key: "myRequests" },
  { path: "/user/bookings", icon: FiCalendar, key: "bookings" },
  { path: "/user/documents", icon: FiFolder, key: "documents" },
  { path: "/user/messages", icon: FiMail, key: "messages" },
  { path: "/user/notifications", icon: FiBell, key: "notifications" },
  { path: "/user/settings", icon: FiSettings, key: "settings" },
];

export const appPageKeys = navItems.map((item) => item.key);
