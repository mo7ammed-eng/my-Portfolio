// ─────────────────────────────────────────────
//  ABOUT SECTION — edit everything here
// ─────────────────────────────────────────────

import {
  SiReact, SiNextdotjs, SiJavascript, SiTypescript, SiHtml5, SiCss,
  SiTailwindcss, SiNodedotjs, SiExpress, SiPhp, SiMysql, SiMongodb,
  SiGit, SiGithub, SiGithubactions, SiPostman, SiGraphql,
} from "react-icons/si";
import { TbApi, TbCode, TbDatabase } from "react-icons/tb";

export const SECTION = {
  label: "About Me",
};

export const HEADING = {
  line1: "Building",
  line2: "for the",
  line3: "web.",   // ghost (outline) style
};

// *word* = highlighted/bold in BlurText
export const BIO = [
  "I'm *Mohammed Waleed*, a *full stack developer* from *Egypt* with six years of programming experience and four years of professional *freelance* delivery. I build *scalable* web applications and *RESTful* APIs that blend solid architecture, clean code, and modern technology into products that are reliable and smooth to use.",
  "My work covers the full stack — from *database* design to polished user interfaces. I mainly work with *React*, *Next.js*, *Node.js*, *Express*, *PHP*, *TypeScript*, *MySQL*, and *MongoDB*, combining frontend and backend development with *AI-powered* workflows to ship faster and with cleaner code.",
  "So far I've delivered multiple client applications *end-to-end* — from an *educational platform* with barcode attendance, parent notifications, and real-time chat to a *commerce platform* with inventory, warehouse management, QR tracking, and analytics dashboards. I'm currently studying while continuing *freelance* full stack development.",
];

export const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL || "";

export const TECH = [
  { name: "React",        icon: SiReact },
  { name: "Next.js",      icon: SiNextdotjs },
  { name: "JavaScript",   icon: SiJavascript },
  { name: "TypeScript",   icon: SiTypescript },
  { name: "HTML5",        icon: SiHtml5 },
  { name: "CSS3",         icon: SiCss },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "Node.js",      icon: SiNodedotjs },
  { name: "Express",      icon: SiExpress },
  { name: "PHP",          icon: SiPhp },
  { name: "MySQL",        icon: SiMysql },
  { name: "MongoDB",      icon: SiMongodb },
];

export const CREATIVE = [
  { name: "REST APIs",    icon: TbApi },
  { name: "GraphQL",      icon: SiGraphql },
  { name: "CI/CD",        icon: SiGithubactions },
  { name: "Git",          icon: SiGit },
  { name: "GitHub",       icon: SiGithub },
  { name: "Postman",      icon: SiPostman },
  { name: "Clean Code",   icon: TbCode },
  { name: "DB Design",    icon: TbDatabase },
];

export const EXPERIENCE = [
  { role: "Team Lead & Full Stack Developer",          period: "Mar 2024 – Sep 2024" },
  { role: "Freelance Full Stack Developer",            period: "2021 – Present" },
];
