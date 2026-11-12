import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import TrackVisit from "@/components/TrackVisit";
import ClientErrorReporter from "@/components/ClientErrorReporter";
import NewsletterPopup from "@/components/NewsletterPopup";
import ThemeLoader from "@/components/ThemeLoader";
import Cursor from "@/components/Cursor";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap"
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mohammedwaleed.dev";

export const viewport = {
  themeColor: "#8B5CF6",
};

export const metadata = {
  metadataBase: new URL(BASE),

  title: {
    default: "Mohammed Waleed — Full Stack Developer",
    template: "%s — Mohammed Waleed | Full Stack Developer",
  },
  description:
    "Full Stack Developer with 6 years of programming experience and 4 years of freelance delivery. Scalable web applications, RESTful APIs, and modern interfaces built with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB.",
  keywords: [
    "Mohammed Waleed", "Full Stack Developer", "React Developer", "Next.js Developer",
    "Node.js Developer", "Express.js", "PHP Developer", "TypeScript",
    "REST API Development", "GraphQL", "MySQL", "MongoDB", "Tailwind CSS",
    "Freelance Full Stack Developer", "Egypt Web Developer", "Portfolio",
  ],
  authors: [{ name: "Mohammed Waleed", url: BASE }],
  creator: "Mohammed Waleed",
  publisher: "Mohammed Waleed",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "Mohammed Waleed — Full Stack Developer",
    title: "Mohammed Waleed — Full Stack Developer",
    description: "Scalable web applications and RESTful APIs built with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB.",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Mohammed Waleed — Full Stack Developer",
    }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mohammed Waleed — Full Stack Developer",
    description: "Scalable web applications and RESTful APIs built with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB.",
    images: ["/og-image.png"],
    creator: "@mo7ammed_waleed",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/photo/favicon.svg", type: "image/svg+xml" },
      { url: "/photo/favicon.png", type: "image/png" },
    ],
    apple: "/photo/favicon.png",
    shortcut: "/photo/favicon.png",
  },

  manifest: "/manifest.webmanifest",

  alternates: { canonical: BASE },

  category: "portfolio",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${BASE}/#person`,
      "name": "Mohammed Waleed",
      "url": BASE,
      "jobTitle": "Full Stack Developer",
      "description": "Full Stack Developer building scalable web applications and RESTful APIs. 6 years of programming experience and 4 years of freelance delivery across international clients.",
      "knowsAbout": [
        "React", "Next.js", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS",
        "Node.js", "Express.js", "PHP", "Laravel", "REST APIs", "GraphQL APIs",
        "MySQL", "MongoDB", "Git", "GitHub", "CI/CD", "Database Design"
      ],
      "hasOccupation": [
        {
          "@type": "Occupation",
          "name": "Full Stack Developer",
          "occupationLocation": { "@type": "Country", "name": "Egypt" },
          "skills": "React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, MongoDB, REST APIs, GraphQL"
        },
        {
          "@type": "Occupation",
          "name": "Team Lead & Full Stack Developer",
          "skills": "Team coordination, Agile workflows, code review, client communication"
        }
      ],
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "Al-Wadi Higher Institute"
      },
      "email": "mailto:mo7ammed.engineer@gmail.com",
      "sameAs": [
        "https://www.linkedin.com/in/mohammed-waleed-83098b370"
      ],
      "makesOffer": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web Application Development",
            "description": "Scalable, production-ready web applications with clean system architecture — from database design to polished, responsive interfaces built with React and Next.js."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Backend Engineering",
            "description": "REST and GraphQL APIs, authentication, third-party integrations, and business logic engineered with Node.js, Express, PHP, and TypeScript."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Large-Scale Platforms",
            "description": "Inventory management, warehouse operations, QR tracking, and analytics dashboards — large-scale commerce platforms built end-to-end."
          }
        }
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${BASE}/#localbusiness`,
      "name": "Mohammed Waleed — Full Stack Developer",
      "image": `${BASE}/og-image.png`,
      "url": BASE,
      "telephone": "+20-103-819-1703",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "EG"
      },
      "priceRange": "$$",
      "description": "Freelance full stack developer building scalable web applications and RESTful APIs.",
      "founder": { "@id": `${BASE}/#person` }
    },
    {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      "url": BASE,
      "name": "Mohammed Waleed — Full Stack Developer",
      "description": "Portfolio of Mohammed Waleed, a full stack developer building scalable web applications and RESTful APIs with React, Next.js, Node.js, Express, PHP, MySQL, and MongoDB.",
      "publisher": { "@id": `${BASE}/#person` },
      "inLanguage": "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": `${BASE}/#profilepage`,
      "url": BASE,
      "name": "Mohammed Waleed — Full Stack Developer Portfolio",
      "isPartOf": { "@id": `${BASE}/#website` },
      "about": { "@id": `${BASE}/#person` },
      "mainEntity": { "@id": `${BASE}/#person` },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Projects", "item": `${BASE}/projects` },
          { "@type": "ListItem", "position": 3, "name": "About", "item": `${BASE}/about` },
          { "@type": "ListItem", "position": 4, "name": "Contact", "item": `${BASE}/contact` },
        ],
      },
    },
    {
      "@type": "ItemList",
      "name": "Services",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Web Application Development",
          "description": "React and Next.js applications with clean architecture, database design, and responsive interfaces",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Backend Engineering",
          "description": "REST and GraphQL APIs with Node.js, Express, PHP, and TypeScript",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Large-Scale Platforms",
          "description": "Inventory, warehouse, QR tracking, and analytics platforms built end-to-end",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What services does Mohammed Waleed offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mohammed Waleed builds full-stack web applications (React, Next.js, Node.js, Express, PHP, TypeScript), REST and GraphQL APIs, database architecture (MySQL, MongoDB), and large-scale platforms with inventory, QR tracking, and analytics dashboards."
          }
        },
        {
          "@type": "Question",
          "name": "How can I hire Mohammed Waleed for a project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Reach out through the contact form at the site's /contact page or email mo7ammed.engineer@gmail.com. Mohammed Waleed is available for freelance projects worldwide."
          }
        },
        {
          "@type": "Question",
          "name": "What technologies does Mohammed Waleed work with?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "React, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, Node.js, Express.js, PHP, REST and GraphQL APIs, MySQL, MongoDB, Git, GitHub, and CI/CD workflows."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Mohammed Waleed based and does he work remotely?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mohammed Waleed is based in Egypt and works remotely with clients across different countries and time zones."
          }
        },
        {
          "@type": "Question",
          "name": "What experience does Mohammed Waleed have?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mohammed Waleed has 6 years of programming experience and 4 years of freelance full stack development. He served as Team Lead & Full Stack Developer from March to September 2024, coordinating cross-functional teams, code reviews, client communication, and end-to-end SDLC delivery."
          }
        },
        {
          "@type": "Question",
          "name": "What projects has Mohammed Waleed built?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An educational platform for chemistry with barcode-based attendance, automated parent notifications, real-time chat, and controlled video access; and a commerce platform with inventory management, warehouse operations, QR tracking, and analytics dashboards using Next.js, TypeScript, Node.js, Express, and GraphQL."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Hire Mohammed Waleed as a Full Stack Developer",
      "description": "Steps to hire Mohammed Waleed for freelance full stack development",
      "totalTime": "PT5M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Visit the contact page",
          "text": "Go to the contact page to find the contact form and inquiry options.",
          "url": `${BASE}/contact`
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Describe your project",
          "text": "Fill out the contact form with your project type, rough scope, and timeline.",
          "url": `${BASE}/contact`
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Receive a response",
          "text": "Mohammed Waleed responds within 24 hours to discuss requirements, timeline, and pricing."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Start the project",
          "text": "Once scope and pricing are agreed upon, work begins with regular updates and delivery milestones."
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": `${BASE}/#webpage`,
      "url": BASE,
      "name": "Mohammed Waleed — Full Stack Developer",
      "isPartOf": { "@id": `${BASE}/#website` },
      "about": { "@id": `${BASE}/#person` },
      "description": "Portfolio of Mohammed Waleed — a full stack developer from Egypt building scalable web applications and RESTful APIs.",
      "inLanguage": "en-US",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", ".hero-tagline", ".about-summary", "article p"]
      }
    }
  ],
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://ip-api.com" />

        {/* ── Structured Data for Google + AI bots ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── LLMs.txt discovery (AI chatbot standard) ── */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site info" />

        {/* ── Custom Search/Keywords XML index for AEO ── */}
        <link rel="search" type="application/xml" href="/searchwords.xml" title="Search Keywords" />

        {/* ── Google Search Console verification ── */}
        {process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION} />
        )}

        {/* ── Bing Webmaster Tools verification ── */}
        {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
          <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
        )}
      </head>
      <body>
        <ThemeLoader />
        <Cursor />
        <TrackVisit />
        <ClientErrorReporter />
        <div className="bottom-blur" aria-hidden="true" />
        {children}
                <NewsletterPopup />
      </body>
    </html>
  );
}

