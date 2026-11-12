"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION } from "@/app/work/content";

gsap.registerPlugin(ScrollTrigger);

const ICON_SVGS = {
  web: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 opacity-20 group-hover:opacity-60 transition-opacity duration-500">
      <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 14h32" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="11" r="1.2" fill="currentColor"/>
      <circle cx="13" cy="11" r="1.2" fill="currentColor"/>
      <circle cx="17" cy="11" r="1.2" fill="currentColor"/>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 opacity-20 group-hover:opacity-60 transition-opacity duration-500">
      <ellipse cx="20" cy="9" rx="11" ry="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 9v10c0 2.2 4.9 4 11 4s11-1.8 11-4V9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 19v10c0 2.2 4.9 4 11 4s11-1.8 11-4V19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 20l3 3-3 3M26 20l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  commerce: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 opacity-20 group-hover:opacity-60 transition-opacity duration-500">
      <path d="M7 12h26l-2.5 17a3 3 0 0 1-3 2.6h-15a3 3 0 0 1-3-2.6L7 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 15V10a6 6 0 0 1 12 0v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 22h10M15 27h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const FALLBACK_SERVICES = [
  {
    num: "01",
    label: "Web Applications",
    title: "Web Applications",
    description:
      "Scalable, production-ready web applications with clean system architecture — from database design to polished, responsive interfaces built with React and Next.js.",
    icon: "web",
    href: "/projects?cat=website",
  },
  {
    num: "02",
    label: "Backend Engineering",
    title: "Backend Engineering",
    description:
      "REST and GraphQL APIs, authentication, third-party integrations, and business logic engineered with Node.js, Express, PHP, and TypeScript.",
    icon: "api",
    href: "/projects?cat=api",
  },
  {
    num: "03",
    label: "Platforms",
    title: "Large-Scale Platforms",
    description:
      "Inventory management, warehouse operations, QR tracking, and analytics dashboards — large-scale commerce platforms built end-to-end.",
    icon: "commerce",
    href: "/projects?cat=platform",
  },
];

export default function Work() {
  const ref = useRef(null);
  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const rows = Array.isArray(d) ? d : d?.data;
        if (!Array.isArray(rows) || !rows.length) return;
        setServices(
          rows.map((s, i) => ({
            num: s.num || String(i + 1).padStart(2, "0"),
            label: s.label,
            title: s.title,
            description: s.description,
            icon: s.icon || "web",
            href: s.href || "/projects",
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".work-item").forEach((item) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none none" },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });

      gsap.to(ref.current, {
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 80%",
          end: "bottom 20%",
          scrub: 1,
        },
        opacity: 0,
        y: -50,
      });
    }, ref);
    return () => ctx.revert();
  }, [services]);

  return (
    <section
      ref={ref}
      id="work-section"
      className="relative w-full min-h-screen px-10 md:px-20 pt-64 pb-72 flex flex-col justify-center"
    >
      <div className="max-w-4xl w-full">

        {/* Header and Filters */}
        <div className="mb-14 md:mb-20">
          <p className="font-sans text-[10px] text-[var(--primary)] tracking-[0.5em] uppercase mb-4 font-medium">
            {SECTION.label}
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-sans font-black tracking-tighter text-white leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
            >
              {SECTION.heading}
            </h2>

            {/* Category pills — decorative only */}
            <div className="flex flex-wrap gap-2 lg:pb-2">
              {services.map((svc) => (
                <Link
                  key={svc.title}
                  href={svc.href || "/projects"}
                  className="px-4 py-2 rounded-full text-[10px] md:text-xs font-medium tracking-widest uppercase transition-all duration-300 bg-transparent text-white/40 border border-white/10 hover:text-white hover:border-white/30"
                >
                  {svc.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="flex flex-col">
          {services.map((cat) => {
            const Icon = ICON_SVGS[cat.icon] || ICON_SVGS.web;
            return (
              <Link
                key={cat.num}
                href={cat.href || "/projects"}
                className="work-item group relative flex items-start gap-8 py-10 md:py-14 border-b border-white/8 hover:border-white/20 transition-all duration-500"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--primary)] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />

                {/* Number */}
                <div className="pl-3 shrink-0 w-8 pt-1">
                  <span className="font-mono text-[10px] text-white/20 group-hover:text-[var(--primary)] tracking-widest transition-colors duration-300">
                    {cat.num}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-500 ease-out">
                  <p className="font-sans text-[10px] text-white/30 group-hover:text-[var(--primary)]/70 tracking-[0.4em] uppercase font-light mb-2 transition-colors duration-300">
                    {cat.label}
                  </p>
                  <h3 className="font-sans text-xl md:text-2xl font-black text-white tracking-tighter mb-3 group-hover:text-white transition-colors duration-300">
                    {cat.title}
                  </h3>
                  <p className="font-sans text-sm text-white/35 group-hover:text-white/60 font-light leading-relaxed max-w-2xl transition-colors duration-300">
                    {cat.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-white/20 group-hover:text-white/55 tracking-widest uppercase transition-colors duration-200">
                    View Projects
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>

                {/* Icon */}
                <div className="hidden md:flex shrink-0 items-center pt-2 text-white">
                  {Icon}
                </div>
              </Link>
            );
          })}

          {/* 4th item — View Full Projects CTA */}
          <Link
            href="/projects"
            className="work-item group relative flex items-center gap-8 py-10 md:py-14 border-b border-white/8 hover:border-white/20 transition-all duration-500"
          >
            <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--primary)] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
            <div className="pl-3 shrink-0 w-8">
              <span className="font-mono text-[10px] text-white/20 group-hover:text-[var(--primary)] tracking-widest transition-colors duration-300">→</span>
            </div>
            <div className="flex-1 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-500 ease-out">
              <p className="font-sans text-[10px] text-white/30 group-hover:text-[var(--primary)]/70 tracking-[0.4em] uppercase font-light mb-2 transition-colors duration-300">
                Full Portfolio
              </p>
              <h3 className="font-sans text-xl md:text-2xl font-black text-white tracking-tighter group-hover:text-white transition-colors duration-300">
                View All Projects
              </h3>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/20 group-hover:text-[var(--primary)] transition-colors duration-300 pr-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14h16M16 8l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}
