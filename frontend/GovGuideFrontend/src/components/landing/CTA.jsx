import { motion } from "framer-motion";
import Button from "../ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#0F172A]">
      {/* Layered background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-indigo-900/20 to-transparent" />
        {/* Radial glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/10 blur-3xl" />
        {/* Very subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-100 text-sm font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Join 10,000+ citizens already using GovGuide
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Ready to simplify
            <br />
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              government services?
            </span>
          </h2>

          <p className="text-lg text-blue-100/80 mb-12 max-w-xl mx-auto leading-relaxed">
            Create your free account and experience a smarter, faster way to
            navigate civic processes — from passport renewal to business
            registration.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="no-underline">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-lg shadow-black/20 transition-all duration-200 group"
                data-testid="cta-create-account"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login" className="no-underline">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium
    border border-[var(--primary)]/40
    text-white
    bg-white/5 backdrop-blur-sm
    hover:!bg-[var(--primary)]
    hover:!text-white
    hover:!border-[var(--primary)]
    transition-all duration-200"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Micro trust signals */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-blue-100/60 font-medium">
            <span>No credit card required</span>
            <span className="hidden sm:inline opacity-40">·</span>
            <span>Free forever for citizens</span>
            <span className="hidden sm:inline opacity-40">·</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
