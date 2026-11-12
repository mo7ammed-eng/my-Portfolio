"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurText from "./BlurText";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK = {
  label: "Full Stack Developer",
  ghost_line: "Hey, I'm",
  name_line: "Waleed.",
  paragraph1:
    "I build *scalable* web applications and *RESTful* APIs that blend solid architecture, clean code, and modern technology into products that are reliable and *smooth* to use. My work covers the full stack — from *database* design to polished user interfaces.",
  paragraph2:
    "I mainly work with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB, combining frontend and backend development with *AI-powered* workflows to ship faster and with *cleaner* code.",
  paragraph3:
    "So far, I've delivered multiple client applications *end-to-end* — from an educational platform with barcode attendance and real-time chat to a *commerce* platform with inventory, QR tracking, and analytics dashboards. I'm currently studying while continuing *freelance* full stack development.",
  cta_text: "Explore ↓",
};

export default function Hero() {
  const ref = useRef(null);
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    fetch("/api/hero")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.label) setData({ ...FALLBACK, ...d });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-label", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.4 });
      gsap.from(".hero-line",  { y: 90, opacity: 0, stagger: 0.1, duration: 1.1, ease: "power4.out", delay: 0.6 });
      
      // Premium staggered letter effect for the main name
      gsap.from(".hero-letter", { 
        y: 100, 
        opacity: 0, 
        rotateX: -40,
        stagger: 0.06, 
        duration: 1.2, 
        ease: "power4.out", 
        delay: 0.7 
      });

      gsap.from(".hero-sub",   { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 1.4 });

      gsap.to(ref.current, {
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 60%",
          end:   "bottom 10%",
          scrub: 1.2,
        },
        opacity: 0,
        y: -50,
      });
    }, ref);
    return () => ctx.revert();
  }, [data.name_line]);

  return (
    <section
      ref={ref}
      className="relative min-h-[135vh] flex flex-col justify-center px-10 md:px-24 overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl">
        <p className="hero-label text-[10px] md:text-xs text-[var(--primary)] tracking-[0.2em] uppercase font-bold mb-6">
          {data.label}
        </p>

        <h1
          className="font-black tracking-tighter leading-[0.75] mb-12 flex flex-col relative z-10 hero-clamp-text"
        >
          <span className="hero-line block ghost z-0">{data.ghost_line}</span>
          <span className="block text-white -mt-2 md:-mt-6 z-10 hero-perspective">
            {(data.name_line || "").split("").map((char, index) => (
              <span key={`${index}-${char}`} className="hero-letter inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </h1>

        <div className="max-w-lg hero-sub flex flex-col gap-6">
          <BlurText
            text={data.paragraph1}
            delay={30}
            animateBy="words"
            direction="bottom"
            stepDuration={0.22}
            className="text-base md:text-[17px] text-white/60 font-medium leading-[1.6]"
          />
          <BlurText
            text={data.paragraph2}
            delay={22}
            animateBy="words"
            direction="bottom"
            stepDuration={0.2}
            className="text-xs md:text-sm text-white/40 font-light leading-relaxed"
          />
          <BlurText
            text={data.paragraph3}
            delay={15}
            animateBy="words"
            direction="bottom"
            stepDuration={0.18}
            className="text-xs md:text-sm text-white/30 font-light leading-relaxed"
          />

          <p className="mt-8 text-[10px] text-white/40 tracking-[0.4em] uppercase font-medium">
            {data.cta_text}
          </p>
        </div>
      </div>

    </section>
  );
}
