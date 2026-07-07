import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Search,
  Settings,
  HelpCircle,
  Bot,
  Bell,
  Clock,
  ChevronRight,
} from "lucide-react";
import { BsBank2 } from "react-icons/bs";

import Badge from "../landing/ui/Badge";
export default function DashboardShowcase() {
  return (
    <section
      className="py-28 bg-[var(--background)] overflow-hidden"
      id="dashboard"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Dashboard
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
          >
            Your personal government services hub
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            A beautiful, intuitive dashboard that puts you in control of all
            civic interactions.
          </motion.p>
        </div>

        {/* Outer glow + float container */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Ambient glow behind the frame */}
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/8 via-indigo-100/30 to-transparent rounded-3xl blur-2xl -z-10" />
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 to-indigo-500/5 rounded-3xl -z-10" />

          {/* Floating animation on the whole panel */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          >
            {/* Browser chrome */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl shadow-slate-300/40 overflow-hidden">
              {/* Title bar */}
              <div className="h-11 bg-gradient-to-b from-slate-50 to-slate-100/60 border-b border-[var(--border)] flex items-center px-4 gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto bg-[var(--background)] border border-[var(--border)] h-6 rounded-md px-3 flex items-center w-60 justify-center text-[11px] text-[var(--text-secondary)] font-medium shadow-sm gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  app.govguide.eg/dashboard
                </div>
              </div>

              {/* Dashboard body */}
              <div className="flex h-[580px] bg-[var(--background-secondary)]">
                {/* Sidebar */}
                <div className="w-60 border-r border-[var(--border)] bg-[var(--background)] px-3 py-4 hidden md:flex flex-col gap-6">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                      {" "}
                      <BsBank2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-base text-[var(--text)] tracking-tight">
                      GovGuide
                    </span>
                  </div>

                  <nav className="space-y-0.5 flex-1">
                    {[
                      {
                        icon: LayoutDashboard,
                        label: "Overview",
                        active: true,
                      },
                      { icon: FileText, label: "My Requests", active: false },
                      { icon: Search, label: "Services", active: false },
                      { icon: Bot, label: "AI Assistant", active: false },
                      { icon: Settings, label: "Settings", active: false },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-3 cursor-pointer transition-colors ${active ? "bg-primary/8 text-primary" : "text-[var(--text-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--text)]"}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </nav>

                  <div className="mt-auto">
                    <div className="px-3 py-2 rounded-lg text-[var(--text-secondary)] text-sm flex items-center gap-3 cursor-pointer hover:bg-[var(--background-secondary)]">
                      <HelpCircle className="h-4 w-4 shrink-0" /> Help & Support
                    </div>
                    {/* User pill at bottom */}
                    <div className="mt-3 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        AM
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">
                          Ahmed Mohamed
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate">
                          Citizen account
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main area */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
                        Welcome back, Ahmed 👋
                      </h1>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        Here's the status of your applications.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <input
                          type="text"
                          placeholder="Search services..."
                          className="h-8 w-52 rounded-lg border border-[var(--border)] bg-[var(--background)] pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-[var(--text-secondary)]/60"
                        />
                      </div>
                      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
                        <Bell className="h-3.5 w-3.5" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border border-white" />
                      </button>
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Active",
                        value: "3",
                        color: "text-[var(--text)]",
                        bg: "from-blue-50/80 to-white",
                      },
                      {
                        label: "Pending",
                        value: "2",
                        color: "text-amber-600",
                        bg: "from-amber-50/80 to-white",
                      },
                      {
                        label: "Completed",
                        value: "5",
                        color: "text-emerald-600",
                        bg: "from-emerald-50/80 to-white",
                      },
                    ].map(({ label, value, color, bg }) => (
                      <div
                        key={label}
                        className={`bg-gradient-to-br ${bg} p-4 rounded-xl border border-[var(--border)] shadow-sm`}
                      >
                        <div className="text-xs text-[var(--text-secondary)] font-medium mb-1.5">
                          {label}
                        </div>
                        <div className={`text-2xl font-bold ${color}`}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom panels */}
                  <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Recent activity */}
                    <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center">
                        <h3 className="font-semibold text-sm">
                          Recent Activity
                        </h3>
                        <button className="text-xs text-primary font-medium hover:underline">
                          View all
                        </button>
                      </div>
                      <div className="flex-1 p-2 space-y-0.5">
                        {[
                          {
                            label: "Passport Renewal",
                            time: "2 hrs ago",
                            status: "In Progress",
                            statusStyle:
                              "text-amber-600 border-amber-200 bg-amber-50",
                            icon: FileText,
                            iconBg: "bg-blue-50 text-blue-600",
                          },
                          {
                            label: "National ID Replacement",
                            time: "Yesterday",
                            status: "Completed",
                            statusStyle:
                              "text-emerald-600 border-emerald-200 bg-emerald-50",
                            icon: FileText,
                            iconBg: "bg-emerald-50 text-emerald-600",
                          },
                          {
                            label: "Birth Certificate",
                            time: "3 days ago",
                            status: "Pending",
                            statusStyle:
                              "text-slate-600 border-[var(--border)] bg-[var(--background-secondary)]",
                            icon: FileText,
                            iconBg:
                              "bg-[var(--background-secondary)] text-slate-500",
                          },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.label}
                              className="p-2.5 hover:bg-[var(--background-secondary)] rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
                            >
                              <div
                                className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">
                                  {item.label}
                                </p>
                                <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                                  <Clock className="h-2.5 w-2.5" /> {item.time}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 ${item.statusStyle}`}
                              >
                                {item.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommended services */}
                    <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-sm">
                          Recommended Services
                        </h3>
                      </div>
                      <div className="flex-1 p-3 space-y-2">
                        {[
                          {
                            name: "Birth Certificate Copy",
                            desc: "Request an official copy online",
                          },
                          {
                            name: "Driver's License Renewal",
                            desc: "Renew before it expires",
                          },
                          {
                            name: "Tax Clearance Certificate",
                            desc: "Required for business filing",
                          },
                        ].map((s) => (
                          <div
                            key={s.name}
                            className="p-2.5 border border-[var(--border)] rounded-lg hover:border-primary/40 hover:bg-primary/2 cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-xs group-hover:text-primary transition-colors">
                                {s.name}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)] group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                              {s.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI chat bubble overlay */}
              <div className="absolute bottom-7 right-7 flex flex-col items-end gap-3 z-20">
                <div className="bg-[var(--background)]/95 backdrop-blur-sm border border-[var(--border)] rounded-2xl rounded-br-sm px-4 py-3 shadow-lg w-64">
                  <p className="text-xs font-semibold mb-0.5 text-[var(--text)]">
                    Hi Ahmed!
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Your passport expires in 30 days. Want to start the renewal?
                  </p>
                </div>
                <button className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform">
                  <Bot className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 rounded-b-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
