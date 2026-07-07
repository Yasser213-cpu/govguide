import { BsBank2 } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-[#0F172A] pt-20 pb-10 overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                {" "}
                <BsBank2 className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                GovGuide
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-7 leading-relaxed max-w-[200px]">
              Simplifying government services for everyone.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: ["Services", "AI Assistant", "Appointments", "Dashboard"],
            },
            {
              title: "Company",
              links: ["About", "Contact", "Blog", "Careers"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-white text-sm mb-5 tracking-wide">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2024 GovGuide. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with trust, transparency, and technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
