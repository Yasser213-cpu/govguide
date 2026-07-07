import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
const items = [
  ["Complex navigation & jargon", "Simple, semantic search"],
  ["Manual, paper-based processes", "AI-powered step-by-step guidance"],
  ["Scattered across multiple sites", "One unified platform"],
  ["No appointment tracking", "Real-time dashboard & tracking"],
  ["Slow and confusing experience", "Fast, intuitive, and modern"],
];
export default function Comparison() {
  return (
    <section
      className="py-28 bg-gradient-to-b from-[var(--background)] to-[var(--background-secondary)]"
      id="services"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-4"
          >
            Why GovGuide
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-5"
          >
            A better way to access government services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            See why citizens are switching to GovGuide for their everyday civic
            needs.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_40px_1fr] gap-0 mb-4 px-1">
            <div className="text-center">
              <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Traditional Websites
              </span>
            </div>
            <div />
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary uppercase tracking-wide">
                GovGuide
                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Recommended
                </span>
              </span>
            </div>
          </div>

          {/* Comparison rows */}
          <div className="space-y-3">
            {items.map(([before, after], index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.45 }}
                className="grid grid-cols-[1fr_40px_1fr] gap-0 items-center"
              >
                {/* Before */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <X className="h-3 w-3 text-red-500" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {before}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[var(--border)]" />
                </div>

                {/* After */}
                <div className="bg-gradient-to-r from-[var(--primary)]/5 to-transparent border border-[var(--primary)]/25 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">
                    {after}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
