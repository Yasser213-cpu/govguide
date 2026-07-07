import { motion } from "framer-motion";
import { Search, BookOpen, CalendarCheck, BarChart3 } from "lucide-react";
const steps = [
  {
    num: "01",
    icon: Search,
    title: "Search",
    description:
      "Find any government service instantly using natural language \u2014 no jargon, no confusion.",
    color: "from-blue-500 to-indigo-600",
    light: "bg-blue-50 text-blue-600",
  },
  {
    num: "02",
    icon: BookOpen,
    title: "Learn",
    description:
      "Read clear, AI-generated requirements and step-by-step guidance for your exact situation.",
    color: "from-violet-500 to-purple-600",
    light: "bg-violet-50 text-violet-600",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "Book",
    description:
      "Schedule your appointment online, at any time, with real availability from service providers.",
    color: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50 text-emerald-600",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Track",
    description:
      "Monitor every request from your unified dashboard with real-time status notifications.",
    color: "from-amber-500 to-orange-600",
    light: "bg-amber-50 text-amber-600",
  },
];
export default function HowItWorks() {
  return (
    <section
      className="py-28 bg-gradient-to-b from-slate-50/70 to-white"
      id="how-it-works"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
          >
            From search to done — in minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Our streamlined process eliminates confusion, paperwork, and waiting
            times completely.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px z-0">
            <div className="w-full h-full bg-gradient-to-r from-blue-200 via-violet-200 via-emerald-200 to-amber-200" />
            {/* Animated dot */}
            <motion.div
              animate={{ x: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.55 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div
                    className={`relative w-[88px] h-[88px] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="h-9 w-9 text-white" />
                    {/* Step number badge */}
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {step.num}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2.5 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
