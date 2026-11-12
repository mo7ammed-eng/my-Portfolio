import PageShell from "@/components/PageShell";
import AboutPage from "@/views/about";

export const metadata = {
  title:       "About — Full Stack Developer from Egypt",
  description: "Meet Mohammed Waleed — a full stack developer from Egypt with 6 years of programming experience and 4 years of freelance delivery. Expert in React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB. Available for hire worldwide.",
  keywords:    ["full stack developer Egypt", "React developer for hire", "Next.js developer", "Node.js developer", "freelance full stack developer", "Mohammed Waleed about"],
  alternates:  { canonical: "https://mohammedwaleed.dev/about" },
  openGraph: {
    title: "About Mohammed Waleed — Full Stack Developer",
    description: "Full stack developer from Egypt specializing in scalable web applications, RESTful APIs, and modern interfaces. Hire for freelance projects worldwide.",
  },
};

export default function Page() {
  return (
    <PageShell>
      <style>{`.bottom-blur { display: none !important; }`}</style>
      <AboutPage />
    </PageShell>
  );
}
