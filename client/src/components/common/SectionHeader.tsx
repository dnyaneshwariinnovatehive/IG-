import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accent?: string;
}

function renderTitle(title: string, accent?: string) {
  if (!accent) return title;
  const idx = title.toLowerCase().indexOf(accent.toLowerCase());
  if (idx === -1) return title;
  const before = title.slice(0, idx);
  const matched = title.slice(idx, idx + accent.length);
  const after = title.slice(idx + accent.length);
  return (
    <>
      {before}
      <span className="text-blue-600">{matched}</span>
      {after}
    </>
  );
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  accent,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const isCenter = align === "center";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-3 ${isCenter ? "items-center text-center" : "items-start text-left"}`}
    >
      {/* Title */}
      <h2
        className="text-2xl sm:text-3xl lg:text-[2.2rem] font-bold leading-tight text-slate-900"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {renderTitle(title, accent)}
      </h2>

      {/* Blue underline decoration */}
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        className="block rounded-full bg-blue-500"
        style={{
          height: "4px",
          width: "40px",
          transformOrigin: isCenter ? "center" : "left",
        }}
      />

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
