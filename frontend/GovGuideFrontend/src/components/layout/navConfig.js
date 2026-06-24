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
  { path: "/dashboard", icon: FiGrid, key: "dashboard" },
  { path: "/ai-assistant", icon: FiMessageCircle, key: "aiAssistant" },
  { path: "/companies", icon: FiBriefcase, key: "companies" },
  { path: "/my-requests", icon: FiFileText, key: "myRequests" },
  { path: "/bookings", icon: FiCalendar, key: "bookings" },
  { path: "/documents", icon: FiFolder, key: "documents" },
  { path: "/messages", icon: FiMail, key: "messages" },
  { path: "/notifications", icon: FiBell, key: "notifications" },
  { path: "/settings", icon: FiSettings, key: "settings" },
];

export const appPageKeys = navItems.map((item) => item.key);
