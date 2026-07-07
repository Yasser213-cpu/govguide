import { motion } from "framer-motion";
import Button from "../ui/Button";
import {
  ArrowRight,
  Bot,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
export default function HeroSection() {
  return (
    <section
      className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-(--background-primary)"
      id="Home"
    >
      {/* Multi-layer background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Primary radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-(--primary)/8 via-(--primary-light)/40 to-transparent rounded-full blur-3xl" />
        {/* Secondary accent glow - right side */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-radial from-(--secondary-light)/60 to-transparent rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-(--background-primary) to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-10 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-(--radius-full) border border-(--primary)/20 bg-(--primary)/5 text-(--primary) font-medium text-sm mb-8 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>GovGuide Platform 2.0 is now live</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--primary) opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-(--primary)" />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="text-5xl md:text-6xl lg:text-[64px] font-bold tracking-[-0.02em] text-(--text-primary) leading-[1.05] mb-6"
            >
              Government
              <br />
              Services,{" "}
              <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">
                Simplified
              </span>
              <br />
              with AI
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-lg text-(--text-secondary) mb-10 leading-relaxed max-w-md"
            >
              Discover services, understand requirements, book appointments, and
              get AI-powered guidance — all in one modern platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/register" className="no-underline">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold group shadow-lg shadow-(--primary)/25 hover:shadow-(--primary)/40 transition-all duration-200"
                  data-testid="hero-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-medium bg-(--background-primary)/80 hover:bg-(--background-primary) border-(--border) hover:border-(--primary)/30 transition-all duration-200"
                data-testid="hero-watch-demo"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-10 flex items-center gap-4 text-sm text-(--text-secondary)"
            >
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-(--background-primary) shadow-sm bg-gradient-to-br from-(--primary-light) to-(--secondary-light) flex items-center justify-center"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i * 7}&backgroundColor=ebf2ff`}
                      alt=""
                      className="rounded-full"
                    />
                  </div>
                ))}
              </div>
              <div>
                <span className="font-semibold text-(--text-primary)">
                  10,000+
                </span>{" "}
                citizens trust GovGuide
              </div>
            </motion.div>
          </motion.div>

          {/* Right — floating dashboard cards */}
          <div className="relative h-[520px] hidden lg:block">
            {/* Background glow behind cards */}
            <div className="absolute inset-0 bg-gradient-radial from-(--primary)/10 via-(--primary-light)/30 to-transparent rounded-3xl blur-2xl" />

            {/* Card 1 — AI Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 7,
                  ease: "easeInOut",
                }}
                className="absolute top-6 right-12 w-80 bg-(--background-primary)/90 backdrop-blur-sm rounded-(--radius-2xl) shadow-xl shadow-(--neutral-300)/60 border border-(--background-primary)/60 overflow-hidden z-20"
              >
                <div className="px-4 py-3 border-b border-(--border) flex items-center gap-3 bg-(--background-primary)/70">
                  <div className="w-8 h-8 bg-gradient-to-br from-(--primary) to-(--secondary) rounded-(--radius-lg) flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4 text-(--text-inverse)" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-(--text-primary)">
                      AI Assistant
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-(--success)" />
                      <p className="text-xs text-(--text-secondary)">Online</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-(--background-tertiary)/80 space-y-3 h-44">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-(--primary) to-(--secondary) text-(--text-inverse) text-sm py-2 px-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                      I need to renew my passport
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-(--background-primary) border border-(--border) text-sm py-2.5 px-3.5 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm text-(--text-primary)">
                      I can help with that! Here are the documents you need:
                      <ul className="mt-2.5 space-y-1.5 text-xs text-(--text-secondary)">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-(--success) shrink-0" />{" "}
                          Current National ID
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-(--success) shrink-0" />{" "}
                          4 Recent Photos
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-(--success) shrink-0" />{" "}
                          Payment receipt
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Card 2 — My Requests */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute top-60 left-4 w-72 bg-(--background-primary)/90 backdrop-blur-sm rounded-(--radius-2xl) shadow-xl shadow-(--neutral-300)/60 border border-(--background-primary)/60 p-4 z-30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-(--primary-light) rounded-(--radius-lg) flex items-center justify-center">
                      <FileText className="h-4 w-4 text-(--primary)" />
                    </div>
                    <span className="font-semibold text-sm text-(--text-primary)">
                      My Requests
                    </span>
                  </div>
                  {/* No "warning" token exists in theme yet — using default amber for pending state */}
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
                    In Progress
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-(--text-primary)">
                      Passport Renewal
                    </span>
                    <span className="text-(--text-secondary) font-medium">
                      45%
                    </span>
                  </div>
                  <div className="h-2 bg-(--neutral-200) rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-(--primary) to-(--secondary) rounded-full" />
                  </div>
                  <p className="text-xs text-(--text-secondary)">
                    Waiting for background check
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Card 3 — Active Services mini card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5.5,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-16 left-2 w-48 bg-(--background-primary)/90 backdrop-blur-sm rounded-(--radius-2xl) shadow-lg shadow-(--neutral-300)/50 border border-(--background-primary)/60 p-4 z-10"
              >
                <p className="text-xs text-(--text-light) font-medium uppercase tracking-wide mb-1.5">
                  Active Services
                </p>
                <div className="text-3xl font-bold text-(--text-primary) mb-2">
                  3
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {/* Pending kept amber (no warning token defined) */}
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Pending: 2
                  </span>
                  <span className="flex items-center gap-1 text-(--success) font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-(--success)" />
                    Done: 5
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
