const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mohammedwaleed.dev";
const API  = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000/api";

export default async function sitemap() {
  const staticPages = [
    { url: BASE,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/projects`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/about`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },
    { url: `${BASE}/contact`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.75 },
  ];

  let projectPages = [];

  try {
    const res = await fetch(`${API}/projects`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const payload = await res.json();
      const projects = Array.isArray(payload) ? payload : payload?.data;
      if (Array.isArray(projects)) {
        projectPages = projects.map((p) => ({
          url: `${BASE}/project/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        }));
      }
    }
  } catch {
    // API unreachable — serve static pages only
  }

  return [...staticPages, ...projectPages];
}
