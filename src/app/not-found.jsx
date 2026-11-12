import Link from "next/link";

export const metadata = {
  title:       "404 — Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots:      { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="nf-root" aria-labelledby="not-found-heading">
      <div className="nf-grid" aria-hidden="true" />
      <div className="nf-glow" aria-hidden="true" />
      <div className="nf-vignette" aria-hidden="true" />

      <p className="nf-eyebrow">Error / 404</p>

      <div className="nf-code" aria-hidden="true">
        4<span>0</span>4
      </div>

      <h1 id="not-found-heading" className="nf-title">
        This page slipped out of frame.
      </h1>

      <p className="nf-copy">
        The link may be broken, or the page moved. Let&apos;s get you back to
        the work.
      </p>

      <div className="nf-actions">
        <Link href="/" className="nf-btn nf-btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M9 11L4 7l5-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </Link>

        <Link href="/projects" className="nf-btn nf-btn-ghost">
          View projects
        </Link>
      </div>

      <p className="nf-coords">Mohammed Waleed · Full Stack Developer</p>
    </main>
  );
}
