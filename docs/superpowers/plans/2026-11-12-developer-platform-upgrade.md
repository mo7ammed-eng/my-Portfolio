# Developer Portfolio Platform Upgrade — Implementation Plan

**Goal:** Extend the existing Next.js 15 + Laravel 13 + MySQL portfolio with GitHub integration, a public repository browser, and production-grade admin operations (system console, visitors, security, request attribution, light UI).

**Architecture (preserved):**
- Next.js App Router remains the UI + BFF (`/api/*` server routes).
- Laravel remains the REST source of truth (`api/`), protected by Sanctum.
- Next admin auth stays a `jose` JWT cookie (`admin_token`); Laravel admin routes require an authenticated **admin** user (new `is_admin` flag) and are called server-to-server with the service token.
- New generic BFF proxy `/api/admin/[...path]` forwards admin requests to Laravel; specific existing routes keep precedence.
- Public GitHub browsing uses `/api/github/[...path]` → Laravel `/github/*`, published + public only.

**Security boundaries:**
- GitHub tokens encrypted at rest (`encrypted` cast), never sent to the browser.
- Public endpoints filter `status = published AND visibility = public`.
- Webhook requires valid `X-Hub-Signature-256` HMAC.
- Blocked IPs/users enforced by Laravel middleware; admin actions audited.
- API clients use hashed keys; request source never trusts free-form client headers.
- Logs redact passwords/tokens/cookies/authorization headers.

**Phases:**
1. DB migrations + Eloquent models + config (GitHub, retention).
2. Services: GitHub, sync, user-agent parser, system logger, request attribution, visitor tracking.
3. Middleware + exception logging + webhook endpoint.
4. Laravel admin/public controllers + form requests + resources + routes.
5. Next BFF proxies, visitor id, client error reporter.
6. Light admin design system + sidebar/layout/login + overview dashboard with real stats.
7. Admin pages: GitHub repos, system console (SSE), visitors, security, API clients.
8. Public `/open-source` list + repo detail with README, tree, file viewer.
9. Run migrations, start Laravel + Next, API tests, browser tests (Chrome DevTools), fix, report.

**Credentials required (documented in `.env.example`):**
`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_OAUTH_REDIRECT_URI`, `GITHUB_WEBHOOK_SECRET`, optional `GITHUB_TOKEN` fallback. Without them, GitHub connect/sync stays disabled with a clear UI state; public browsing still works for imported public repos via unauthenticated GitHub API (rate-limited).
