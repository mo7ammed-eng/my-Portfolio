# Developer Platform

The portfolio is split into two applications:

- **Next.js (`/`)** — public site, admin UI, and the BFF routes under `src/app/api/*`.
- **Laravel (`api/`)** — source of truth for repositories, monitoring, security, and audit data.

The admin UI talks only to the Next.js BFF. The BFF forwards authenticated admin calls to Laravel using the
`LARAVEL_SERVICE_TOKEN`; browser cookies never contain the Laravel token.

## Environment

### Next.js (`.env.local`)

```env
LARAVEL_API_URL=http://127.0.0.1:8000/api
LARAVEL_SERVICE_TOKEN=<sanctum service token>
JWT_SECRET=<random secret>
ADMIN_EMAIL=mo7ammed.engineer@gmail.com
ADMIN_PASSWORD=<admin password>
NEXT_PUBLIC_GITHUB_USERNAME=<optional github username for the public profile link>
```

### Laravel (`api/.env`)

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/github/callback
GITHUB_WEBHOOK_SECRET=
GITHUB_TOKEN=
GITHUB_API_TIMEOUT=20

SYSTEM_LOG_RETENTION_DAYS=30
REQUEST_ACTIVITY_RETENTION_DAYS=90
VISITOR_RETENTION_DAYS=180
```

`GITHUB_TOKEN` is optional. Without it, public repositories are imported and hydrated through the
unauthenticated GitHub API (lower rate limits). A fine-grained read-only token raises the limit, and OAuth is
required for private repositories and account sync.

## GitHub OAuth app

1. Open **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set **Homepage URL** to the site URL (for example `http://localhost:3000`).
3. Set **Authorization callback URL** to
   `http://localhost:3000/api/admin/github/callback`
   (or the production equivalent).
4. Copy the Client ID and Client Secret into `api/.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
5. Restart Laravel, sign in to `/admin`, and use **GitHub → Connect GitHub**.

The app requests `read:user public_repo`. Connecting an account imports its repositories and enables manual
sync from the admin UI.

## Webhooks

1. Create a webhook on a repository or organization:
   **Settings → Webhooks → Add webhook**.
2. **Payload URL**: the public Laravel endpoint, for example
   `https://api.example.com/api/github/webhook`.
   For local development expose port 8000 through a tunnel (ngrok, Cloudflare Tunnel, etc.) — GitHub cannot
   reach `127.0.0.1`.
3. **Content type**: `application/json`.
4. **Secret**: the same value as `GITHUB_WEBHOOK_SECRET` in `api/.env`.
5. **Events**: at least `push` and `repository`.

The endpoint validates `X-Hub-Signature-256` (HMAC SHA-256) and returns `401` for invalid signatures.
If `GITHUB_WEBHOOK_SECRET` is empty, the endpoint fails closed with `503` until a secret is configured.
Rejected deliveries are recorded as security events and system logs.

## Public repository browser

- `/open-source` — published, public repositories with search, language filters, and sorting.
- `/open-source/[owner]/[repo]` — repository detail, README, file tree, and file preview.

Both pages use the BFF routes `/api/github/*`. The public listing only includes repositories with
`status = published` **and** `visibility = public`. Draft, hidden, rejected, and private repositories never
appear, even if they are imported.

## Admin sections

| Route | Purpose |
| --- | --- |
| `/admin` | Platform metrics, traffic, repository health, recent logs and requests |
| `/admin/github` | OAuth connection, sync, manual import, webhook setup |
| `/admin/repositories` | Publishing workflow, metadata, feature flags |
| `/admin/visitors` | Visitor sessions, pages, devices, request history |
| `/admin/requests` | Request attribution and API traffic |
| `/admin/system` | System console, filtering, CSV export, log detail |
| `/admin/security` | Blocked IPs/users, security events, audit trail |
| `/admin/api-clients` | Issue and revoke hashed API client tokens |

## Monitoring model

- `MonitorRequest` is appended to Laravel's `api` middleware group. It records request activity, attributes
  the request to a known API client when possible, and maintains visitor sessions using the `visitor_id` cookie
  set by the Next.js BFF.
- Admin pages refresh by polling:
  - Dashboard: every 20 seconds
  - Visitors: every 15 seconds
  - Requests: every 10 seconds
  - System console: every 5 seconds when **Live** is enabled
- Polling is used instead of SSE because the Laravel development server runs a single worker and long-lived
  streams would block other requests. A production deployment with a multi-worker server or queue can move to
  SSE/websockets later.
- Frontend errors are reported by `ClientErrorReporter` to `POST /api/logs/client` and appear in the system
  console under the `frontend` category.

## Security

- Admin routes in Laravel use `auth:sanctum` plus the `admin` middleware (`EnsureAdmin`), which requires
  `users.is_admin = true`.
- Blocked IPs are rejected with `403`; expired blocks stop applying automatically.
- The webhook signature check fails closed. Invalid signatures create a security event.
- API client tokens are stored hashed and shown once at creation.
- The Next.js service token is server-only; it is never exposed to the browser.

## Local run

```powershell
# API
cd api
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000

# Frontend
npm run dev
```

Sign in at `http://localhost:3000/admin/login`.

## Known limitations

- OAuth, authenticated sync, higher GitHub rate limits, and live webhook delivery require GitHub credentials
  that are not committed. The UI reports these as "not configured" instead of fabricating success.
- The public site keeps the cinematic dark identity; the admin area intentionally uses a light operations theme.
