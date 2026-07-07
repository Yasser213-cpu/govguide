import { motion } from "framer-motion";
import {
  Bot,
  Search,
  Calendar,
  LayoutDashboard,
  ClipboardList,
  Building,
  Shield,
  Zap,
} from "lucide-react";
const features = [
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Get instant, accurate guidance on any service requirement or process in plain language.",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find the right service in seconds with semantic search that understands intent.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description:
      "Book slots online directly with any service provider and skip the waiting queue.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: LayoutDashboard,
    title: "Personal Dashboard",
    description:
      "Track all your requests, appointments, and documents from one unified interface.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
  },
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description:
      "Real-time status updates on every submitted application, always transparent.",
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Building,
    title: "Company Portal",
    description:
      "Dedicated business accounts with team management and bulk document handling.",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description:
      "Bank-level encryption with full compliance to keep your sensitive data private.",
    gradient: "from-slate-600 to-slate-800",
    bg: "bg-slate-50",
  },
  {
    icon: Zap,
    title: "10x Faster",
    description:
      "Complete traditionally slow manual tasks in minutes, not days.",
    gradient: "from-yellow-500 to-amber-600",
    bg: "bg-yellow-50",
  },
];
export default function FeaturesSection() {
  return (
    <section className="py-28 bg-white" id="features">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5 leading-[1.15]"
          >
            Everything you need to navigate government services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            A comprehensive toolkit designed to make civic interactions
            seamless, transparent, and entirely digital.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="
group relative
rounded-2xl
bg-[var(--background)]
border
border-[var(--border)]
p-6
shadow-sm
transition-all
duration-300
hover:border-[var(--primary)]
hover:shadow-xl
hover:shadow-[color:var(--primary)]/10
"
              >
                {/* Gradient border effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(99,102,241,0.04) 100%)",
                  }}
                />

                <div
                  className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform duration-200`}
                >
                  <div
                    className={`bg-gradient-to-br ${feature.gradient} rounded-lg w-full h-full flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
