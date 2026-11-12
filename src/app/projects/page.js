import { Suspense } from "react";
import Navbar from "../../components/Navbar";
import ProjectsPage from "../../views/projects";

export const metadata = {
  title:       "Projects — Case Studies & Client Work by Mohammed Waleed",
  description: "Explore detailed case studies of Mohammed Waleed's freelance projects — scalable web applications, full stack platforms, inventory and QR tracking systems with tech breakdowns.",
  keywords:    ["full stack projects", "case studies", "web application portfolio", "freelance work", "client projects"],
  alternates:  { canonical: "https://mohammedwaleed.dev/projects" },
  openGraph: {
    title: "Projects — Mohammed Waleed | Case Studies & Client Work",
    description: "Detailed case studies of web applications, APIs, and commerce platforms built by Mohammed Waleed.",
  },
};

export default function Page() {
  return (
    <main>
      <div className="grain-overlay" />
      <Navbar />
      <div className="relative z-10">
        <Suspense fallback={<div className="min-h-screen bg-[#09090F]" />}>
          <ProjectsPage />
        </Suspense>
      </div>
    </main>
  );
}
