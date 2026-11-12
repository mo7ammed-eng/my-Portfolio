"use client";
import { useEffect, useState } from "react";
import {
  SiReact, SiNextdotjs, SiJavascript, SiTypescript, SiHtml5, SiCss,
  SiTailwindcss, SiNodedotjs, SiPhp, SiLaravel, SiMysql, SiMongodb,
  SiGithub, SiGithubactions,
} from "react-icons/si";
import { TbApi, TbCode } from "react-icons/tb";
import { SECTION, HEADING, BIO, RESUME_URL, TECH, CREATIVE, EXPERIENCE } from "@/app/about/content";

const ICONS = {
  react: SiReact,
  nextjs: SiNextdotjs,
  javascript: SiJavascript,
  typescript: SiTypescript,
  html5: SiHtml5,
  css3: SiCss,
  tailwind: SiTailwindcss,
  nodejs: SiNodedotjs,
  php: SiPhp,
  laravel: SiLaravel,
  mysql: SiMysql,
  mongodb: SiMongodb,
  api: TbApi,
  cicd: SiGithubactions,
  github: SiGithub,
};

const resolveIcon = (key, name) => {
  if (key && ICONS[key]) return ICONS[key];
  const found = [...TECH, ...CREATIVE].find(
    (s) => s.name.toLowerCase() === (name || "").toLowerCase()
  );
  return found ? found.icon : TbCode;
};

export function useAboutContent() {
  const [label, setLabel] = useState(SECTION.label);
  const [heading, setHeading] = useState(HEADING);
  const [bio, setBio] = useState(BIO);
  const [resumeUrl, setResumeUrl] = useState(RESUME_URL);
  const [tech, setTech] = useState(TECH);
  const [tools, setTools] = useState(CREATIVE);
  const [experience, setExperience] = useState(EXPERIENCE);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (d.label) setLabel(d.label);
        if (d.heading_line1) {
          setHeading({ line1: d.heading_line1, line2: d.heading_line2 || "", line3: d.heading_line3 || "" });
        }
        if (Array.isArray(d.bio) && d.bio.length) setBio(d.bio);
        setResumeUrl(d.resume_url || "");
      })
      .catch(() => {});

    fetch("/api/skills")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const cats = Array.isArray(d) ? d : d?.data;
        if (!Array.isArray(cats) || !cats.length) return;
        const mapSkill = (s) => ({ name: s.name, icon: resolveIcon(s.icon, s.name) });
        const devops = cats.filter((c) => c.name === "devops");
        const core = cats.filter((c) => c.name !== "devops");
        const techSkills = core.flatMap((c) => (c.skills || []).map(mapSkill));
        const toolSkills = devops.flatMap((c) => (c.skills || []).map(mapSkill));
        if (techSkills.length) setTech(techSkills);
        if (toolSkills.length) setTools(toolSkills);
      })
      .catch(() => {});

    fetch("/api/experiences")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const rows = Array.isArray(d) ? d : d?.data;
        if (!Array.isArray(rows) || !rows.length) return;
        setExperience(
          rows.map((e) => ({
            role: e.company ? `${e.role} · ${e.company}` : e.role,
            period:
              e.is_current || !e.end_date
                ? `${e.start_date} – Present`
                : `${e.start_date} – ${e.end_date}`,
          }))
        );
      })
      .catch(() => {});
  }, []);

  return { label, heading, bio, resumeUrl, tech, tools, experience };
}
