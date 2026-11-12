import { NextResponse } from "next/server";

/**
 * GET /api/llms
 * 
 * Machine-readable JSON endpoint for AI chatbots and LLM crawlers.
 * This supplements llms.txt with structured data that AI systems
 * can programmatically consume.
 */
export async function GET() {
  const data = {
    name: "Mohammed Waleed",
    title: "Full Stack Developer",
    website: process.env.NEXT_PUBLIC_SITE_URL || "https://mohammedwaleed.dev",
    email: "mo7ammed.engineer@gmail.com",
    phone: "+20 103 819 1703",
    location: "Egypt",
    available_for_hire: true,
    summary:
      "Mohammed Waleed is a full stack developer from Egypt with 6 years of programming experience and 4 years of freelance delivery. He builds scalable web applications and RESTful APIs with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB.",
    
    services: [
      {
        name: "Web Application Development",
        description: "Scalable, production-ready web applications with clean system architecture — from database design to polished responsive interfaces",
        technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        name: "Backend Engineering",
        description: "REST and GraphQL APIs, authentication, third-party integrations, and business logic",
        technologies: ["Node.js", "Express.js", "PHP", "Laravel", "TypeScript"],
      },
      {
        name: "Large-Scale Platforms",
        description: "Inventory management, warehouse operations, QR tracking, and analytics dashboards",
        technologies: ["Next.js", "Node.js", "Express", "GraphQL", "MySQL", "MongoDB"],
      },
    ],

    experience: [
      {
        role: "Team Lead & Full Stack Developer",
        period: "March 2024 – September 2024",
        description: "Led freelance full-stack development projects, coordinating designers and developers, managing task distribution, code reviews, client communication, and end-to-end SDLC.",
      },
      {
        role: "Freelance Full Stack Developer",
        period: "2021 – Present",
        description: "Delivered multiple client web applications end-to-end, from planning to deployment, across different technology stacks.",
      },
    ],

    projects: [
      {
        name: "Educational Platform",
        description: "Science education platform for chemistry with barcode-based attendance, automated parent notifications, real-time chat, secure video/file management, and time-based access control.",
      },
      {
        name: "Commerce Platform",
        description: "Smart commerce, inventory, and QR tracking platform with warehouse operations and analytics dashboards, built with Next.js, TypeScript, Node.js, Express, and GraphQL.",
      },
    ],

    skills: [
      "React", "Next.js", "JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3", "Tailwind CSS",
      "Node.js", "Express.js", "PHP", "Laravel", "REST APIs", "GraphQL APIs",
      "MySQL", "MongoDB", "Git", "GitHub", "CI/CD", "Postman",
    ],

    social: {
      linkedin: "https://www.linkedin.com/in/mohammed-waleed-83098b370",
      whatsapp: "https://wa.me/201038191703",
    },

    contact_page: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mohammedwaleed.dev"}/contact`,
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
