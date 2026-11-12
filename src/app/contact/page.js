import PageShell from "@/components/PageShell";
import ContactPage from "@/views/contact";

export const metadata = {
  title:       "Contact — Hire Mohammed Waleed, Full Stack Developer",
  description: "Get in touch with Mohammed Waleed to hire a freelance full stack developer. Web applications, REST and GraphQL APIs, and large-scale platforms. Available for projects worldwide.",
  keywords:    ["hire full stack developer", "hire React developer", "hire Next.js developer", "freelance developer contact", "get quote web application"],
  alternates:  { canonical: "https://mohammedwaleed.dev/contact" },
  openGraph: {
    title: "Hire Mohammed Waleed — Full Stack Developer",
    description: "Contact Mohammed Waleed for freelance web application development, backend engineering, and platform projects. Available worldwide.",
  },
};

export default function Page() {
  return (
    <PageShell>
      <ContactPage />
    </PageShell>
  );
}
