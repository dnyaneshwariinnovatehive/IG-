import { Link } from "react-router-dom";
import { Settings, Twitter, Linkedin, Instagram, Github } from "lucide-react";

const exploreLinks = [
  { label: "Trending Projects", href: "/#trending" },
  { label: "Newly Added", href: "/#newly-added" },
  { label: "Top Selling", href: "/#top-selling" },
  { label: "Browse All", href: "/browse" },
  { label: "Categories", href: "/#categories" },
];

const resourceLinks = [
  { label: "Custom Project", href: "/custom-project" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Case Study", href: "/case-study" },
  { label: "FAQ", href: "/faq" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const socialLinks = [
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: <Twitter size={17} strokeWidth={1.8} />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: <Linkedin size={17} strokeWidth={1.8} />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: <Instagram size={17} strokeWidth={1.8} />,
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: <Github size={17} strokeWidth={1.8} />,
  },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3
        className="text-sm font-semibold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "0.1em" }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0F172A",
        borderTop: "1px solid rgba(148,163,184,0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors duration-200">
                <Settings className="text-white" size={17} strokeWidth={2.2} />
              </span>
              <span
                className="text-lg font-bold tracking-tight text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                InnovateGuide
              </span>
            </Link>

            <p
              className="text-sm text-slate-400 leading-relaxed max-w-xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              The premium marketplace for student-built software innovations.
            </p>

            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white transition-colors duration-200"
                  style={{
                    background: "rgba(148,163,184,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(37,99,235,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(148,163,184,0.1)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div
          className="mt-12 mb-6"
          style={{ borderTop: "1px solid rgba(148,163,184,0.12)" }}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-slate-500"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            &copy; 2025 InnovateGuide. All rights reserved.
          </p>
          <p
            className="text-xs text-slate-600"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Powered by{" "}
            <span className="text-slate-500 font-medium">InnovateHive</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
