import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { BsBank2 } from "react-icons/bs";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#Home" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },

  { label: "FAQ", href: "#faq" },
];
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl  shadow-sm shadow-slate-900/5" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-testid="link-home"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            {" "}
            <BsBank2 className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            GovGuide
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100/80 rounded-lg transition-all duration-150"
              data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="no-underline">
            <Button
              variant="ghost"
              className="font-medium text-sm text-muted-foreground hover:text-foreground h-9"
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </Link>
          <Link to="/register" className="no-underline">
            <Button
              className="font-semibold text-sm h-9 px-5 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all duration-200"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-foreground hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/70 overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-5 flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="py-2.5 px-3 text-base font-medium text-foreground hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="w-full justify-center font-medium"
                >
                  Sign In
                </Button>
                <Button className="w-full justify-center font-semibold shadow-sm shadow-primary/20">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
