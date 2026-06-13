import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Trending", href: "/#trending" },
  { label: "Categories", href: "/browse" },
  { label: "Custom Project", href: "/custom-project" },
];

function useScrollEffect(threshold = 50): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}

export default function Navbar() {
  const scrolled = useScrollEffect(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isProjectPage = location.pathname.startsWith("/projects/");
  const isBrowsePage = location.pathname.startsWith("/browse");

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("?")[0]);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isProjectPage || isBrowsePage
          ? "#0F172A"
          : scrolled
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: isProjectPage || isBrowsePage
          ? "1px solid rgba(148,163,184,0.1)"
          : scrolled
          ? "1px solid rgba(226, 232, 240, 0.8)"
          : "none",
        boxShadow: isProjectPage || isBrowsePage
          ? "none"
          : scrolled
          ? "0 1px 24px 0 rgba(30, 41, 59, 0.08)"
          : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center gap-2 group select-none"
          onClick={closeMobile}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors duration-200">
            <Settings
              className="text-white"
              size={18}
              strokeWidth={2.2}
            />
          </span>
          <span
            className="text-[1.18rem] font-bold tracking-tight"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: isProjectPage || isBrowsePage ? "#fff" : scrolled ? "#1e293b" : "#fff",
              textShadow: isProjectPage || isBrowsePage ? "none" : scrolled ? "none" : "0 1px 8px rgba(0,0,0,0.18)",
              transition: "color 300ms",
            }}
          >
            InnovateGuide
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: active
                      ? "#2563eb"
                      : isProjectPage || isBrowsePage
                      ? "rgba(255,255,255,0.92)"
                      : scrolled
                      ? "#334155"
                      : "rgba(255,255,255,0.92)",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: isProjectPage || isBrowsePage ? "#fff" : scrolled ? "#2563eb" : "#fff",
              borderColor: isProjectPage || isBrowsePage
                ? "rgba(255,255,255,0.55)"
                : scrolled
                ? "rgba(37,99,235,0.6)"
                : "rgba(255,255,255,0.55)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                isProjectPage || isBrowsePage ? "rgba(255,255,255,0.12)" : scrolled ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
            }}
          >
            Admin Login
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200"
          style={{
            color: isProjectPage || isBrowsePage ? "#fff" : scrolled ? "#334155" : "#fff",
            background: isProjectPage || isBrowsePage
              ? "rgba(255,255,255,0.12)"
              : scrolled
              ? "rgba(241,245,249,0.8)"
              : "rgba(255,255,255,0.12)",
          }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderTop: "1px solid rgba(226,232,240,0.7)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 pb-4 pt-2 flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={closeMobile}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: active ? "#2563eb" : "#334155",
                      fontWeight: active ? 600 : 500,
                      background: active ? "rgba(37,99,235,0.07)" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex items-center justify-center w-full px-4 py-2 rounded-full border border-blue-400 text-blue-600 text-sm font-medium transition-colors duration-150 hover:bg-blue-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
