import { motion } from "framer-motion";
const stats = [
  {
    value: "10,000+",
    label: "Citizens Served",
    description: "and growing every day",
  },
  {
    value: "500+",
    label: "Government Services",
    description: "all in one platform",
  },
  {
    value: "99%",
    label: "Satisfaction Rate",
    description: "from verified users",
  },
  { value: "24/7", label: "AI Support", description: "always available" },
];
export default function StatsSection() {
  return (
    <section
      className="
py-16
border-y
border-[var(--border)]
bg-gradient-to-b
from-[var(--background-secondary)]
to-[var(--background)]
"
      id="stats"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div
          className="
grid
grid-cols-2
md:grid-cols-4
gap-0
divide-y
divide-[var(--border)]
md:divide-y-0
md:divide-x
"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center px-6 py-6"
            >
              <div
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r
from-[var(--primary)]
to-blue-500 bg-clip-text text-transparent mb-1 tracking-tight"
              >
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
